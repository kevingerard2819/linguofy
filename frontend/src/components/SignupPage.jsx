import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignupPage.css";

const SignupPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");  
    const [success, setSuccess] = useState("");  
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault(); 
        setError("");
        setSuccess("");

        try {
            await axios.post("http://127.0.0.1:5000/signup", { email, password });
            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => navigate("/"), 2000);  
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed. Try again.");
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <div className="header">
                    <div>Sign Up</div>
                </div>
                <form onSubmit={handleSignup}>
                    <div className="inputs">
                        <label>Email</label>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <label>Password</label>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <button type="submit" className="submit-button">Sign Up</button>
                </form>
                <p className="login-text">Already have an account? <a href="/">Login</a></p>
            </div>
        </div>
    );
};

export default SignupPage;
