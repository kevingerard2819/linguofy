import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import "./Navbar.css";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [history, setHistory] = useState({});
    const navigate = useNavigate();
    const userID = sessionStorage.getItem("UserID");
    const userEmail = sessionStorage.getItem("email");

    const handleLogout = () => {
        sessionStorage.removeItem("UserID");
        sessionStorage.removeItem("email");
        navigate("/");
        window.location.reload();
    };

    useEffect(() => {
        if (userEmail) {
            fetch("http://127.0.0.1:5000/get_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            })
                .then((res) => res.json())
                .then((data) => setHistory(data.history || {}))
                .catch((err) => console.error("Error fetching history:", err));
        }
    }, [userEmail]);

    return (
        <>
            <button 
                className={`menu-toggle ${menuOpen ? 'hidden' : ''}`} 
                onClick={() => setMenuOpen(!menuOpen)}
            >
                ☰
            </button>

            <nav className={menuOpen ? "active" : ""}>
                <div className="nav-top">
                    {!menuOpen && ( 
                        <div className="logo-container">
                            <img src={logo} alt="App Logo" className="logo" />
                            <span className="logo-text">Linguofy.ai</span>
                        </div>
                    )}
                </div>
                
                <div className="nav-middle">
                    <div className="page-button">
                        <Link to="/LandingPage" onClick={() => setMenuOpen(false)}>
                            Transcription
                        </Link>
                    
                        <Link to="/Agent" onClick={() => setMenuOpen(false)}>
                            Agent
                        </Link>
                    </div>
                   
                        <div className="sidebar-history-list">
                            {Object.entries(history).length === 0 ? (
                                <p className="sidebar-history-empty">No history available</p>
                            ) : (
                                Object.entries(history).map(([timestamp, text]) => (
                                    <Link
                                        key={timestamp}
                                        to={`/History/${encodeURIComponent(timestamp)}`}
                                        className="sidebar-history-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {new Date(timestamp).toLocaleDateString()} - {text.slice(0, 20)}...
                                    </Link>
                                ))
                            )}
                        </div>
                </div>
                
                <div className="nav-bottom">
                    {userID && (
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                </div>
            </nav>

            {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)}></div>}
        </>
    );
};

export default Navbar;