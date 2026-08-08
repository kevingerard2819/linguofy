import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");  
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); 

        try {
            const response = await axios.post("http://127.0.0.1:5000/login", { email, password });
            sessionStorage.setItem("UserID", response.data.userID);
            sessionStorage.setItem('email', email)
            navigate("/LandingPage");
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <div className="header">
                    <div>Login</div>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="inputs">
                        <label>Email</label>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <label>Password</label>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-button">Login</button>
                </form>
                <p className="login-text">Don't have an account? <a href="/signup">Sign Up</a></p>
            </div>
        </div>
    );
};

export default LoginPage;
