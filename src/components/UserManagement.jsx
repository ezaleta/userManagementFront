import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Trash, LockFill, UnlockFill } from "react-bootstrap-icons";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    let loggedInUser = null;
    let currentUserId = null;

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            currentUserId = decodedToken.id;
            loggedInUser = users.find((user) => user.id === currentUserId);
        } catch (error) {
            console.error("Token Decoding Error:", error);
            localStorage.removeItem("token");
            navigate("/login");
        }
    } else {
        navigate("/login");
    }

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            await fetchUsers();
        };
        if (isMounted) {
            fetchData();
        }
        return () => {
            isMounted = false;
        };
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("/users");
            setUsers(response.data.users);
        } catch (error) {
            console.error("Fetch Users Error:", error);
            if (error.response && error.response.status === 403) {
                localStorage.removeItem("token");
                alert("Your account has been blocked.");
                navigate("/login");
            } else if (error.response && error.response.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            } else {
                setErrorMessage("Failed to fetch users.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUserIds((prevSelected) => (prevSelected.includes(userId) ? prevSelected.filter((id) => id !== userId) : [...prevSelected, userId]));
    };

    const handleSelectAll = () => {
        if (selectedUserIds.length === users.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(users.map((user) => user.id));
        }
    };

    const handleAction = async (action) => {
        try {
            await axiosInstance.post("/users/action", {
                action,
                userIds: selectedUserIds,
            });
            await fetchUsers();
            setSelectedUserIds([]);
            if (selectedUserIds.includes(currentUserId) && (action === "block" || action === "delete")) {
                localStorage.removeItem("token");
                alert("Your account has been modified. Please log in again.");
                navigate("/login");
            }
        } catch (error) {
            console.error("Action Error:", error);
            setErrorMessage(error.response?.data?.message || "Action failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-5 text-center">Hi, {loggedInUser?.name ? loggedInUser.name : ""}!</h1>

            {/* Logout Button */}
            <div className="mb-4 text-end">
                <button className="btn btn-primary" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            {/* Error Message */}
            {errorMessage && (
                <div className="alert alert-danger" role="alert">
                    {errorMessage}
                </div>
            )}
            {/* Toolbar with Icons */}
            <div className="mb-4 text-start">
                <button className="btn btn-danger me-2" onClick={() => handleAction("block")} disabled={selectedUserIds.length === 0}>
                    <LockFill className="me-1" />
                    Block
                </button>
                <button className="btn btn-secondary me-2" onClick={() => handleAction("unblock")} disabled={selectedUserIds.length === 0}>
                    <UnlockFill className="me-1" />
                    Unblock
                </button>
                <button className="btn btn-secondary" onClick={() => handleAction("delete")} disabled={selectedUserIds.length === 0}>
                    <Trash className="me-1" />
                    Delete
                </button>
            </div>
            {/* Loading Indicator */}
            {loading ? (
                <div>Loading users...</div>
            ) : (
                /* User Table with Borders and Highlighted Headers */
                <table className="table table-hover table-striped">
                    <thead className="table-light">
                        <tr>
                            {/* Select All Checkbox */}
                            <th scope="col">
                                <input type="checkbox" checked={selectedUserIds.length === users.length && users.length > 0} onChange={handleSelectAll} />
                            </th>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Last Login Time</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className={selectedUserIds.includes(user.id) ? "table-primary" : ""}>
                                {/* User Checkbox */}
                                <td>
                                    <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleSelectUser(user.id)} />
                                </td>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.last_login_time ? new Date(user.last_login_time).toLocaleString() : "Never"}</td>
                                <td>
                                    <span className={`badge ${user.status === "active" ? "bg-success" : "bg-secondary"}`}>{user.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserManagement;
