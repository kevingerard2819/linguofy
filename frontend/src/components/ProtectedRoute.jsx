import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import logo from "../assets/logo.svg";

const ProtectedRoute = ({ children }) => {
    const userID = sessionStorage.getItem("UserID");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (!userID) {
        return <Navigate to="/" />;
    }

    return (
        <div style={{ display: "flex" }}>
            <Navbar />
            <div style={{ 
                marginLeft: isMobile ? "0" : "240px", 
                flex: 1,
                transition: "margin-left 0.3s ease",
                padding: "20px"
            }}>
                {isMobile && (
                    <div
                        className="logo-container"
                        style={{
                            position: "absolute",
                            top: "20px",  // Added margin on top
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "10px",
                            zIndex: 1001,  // Ensure logo is on top of content
                            width: "100%",  // Prevent overflow or misalignment
                            padding: "5px 0",  // Added padding to the logo container
                        }}
                    >
                        <img src={logo} alt="App Logo" className="logo" style={{ width: "35px", height: "35px" }} />
                        <span className="logo-text" style={{ fontSize: "1.2rem" }}>Linguofy.ai</span>
                    </div>
                )}

                {children}
            </div>
        </div>
    );
};

export default ProtectedRoute;