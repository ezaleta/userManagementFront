import { useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

function RegistrationForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await axiosInstance.post("/register", { name, email, password });
            navigate("/login");
        } catch (error) {
            console.error("Registration Error:", error);
            setErrorMessage(error.response?.data?.message || "Registration failed");
        }
    };
    return (
        <div className="container mt-5">
            <h2 className="mb-4">Registration</h2>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="registration card mt-5 p-4">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                        <label htmlFor="name" className="form-label">
                            Name:
                        </label>
                        <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="mb-3 text-start">
                        <label htmlFor="email" className="form-label">
                            Email address:
                        </label>
                        <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-3 text-start">
                        <label htmlFor="password" className="form-label">
                            Password (at least one character):
                        </label>
                        <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="1" />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegistrationForm;
