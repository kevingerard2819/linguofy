import { useState, useEffect } from "react";
import "./HistoryPage.css";

const SavedTranscriptPage = () => {
    const [history, setHistory] = useState({});
    const [editing, setEditing] = useState(null);
    const [updatedText, setUpdatedText] = useState("");

    const userEmail = sessionStorage.getItem("email");

    useEffect(() => {
        if (userEmail) {
            fetchHistory();
        }
    }, [userEmail]);

    const fetchHistory = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/get_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            setHistory(data.history || {});
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const handleEdit = (timestamp, text) => {
        setEditing(timestamp);
        setUpdatedText(text);
    };

    const handleSave = async (timestamp) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/update_history", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    timestamp,
                    updated_summary: updatedText,
                }),
            });

            if (response.ok) {
                setHistory((prev) => ({
                    ...prev,
                    [timestamp]: updatedText,
                }));
                setEditing(null);
            }
        } catch (error) {
            console.error("Error updating history:", error);
        }
    };

    return (
        <div className="history-container">
            <h2>Your Transcription History</h2>
            {!userEmail ? (
                <p>Please log in to view your history.</p>
            ) : Object.keys(history).length === 0 ? (
                <p>No history available.</p>
            ) : (
                <ul className="history-list">
                    {Object.entries(history).map(([timestamp, text]) => (
                        <li key={timestamp} className="history-item">
                            {editing === timestamp ? (
                                <>
                                    <textarea className="edit-textarea"
                                        value={updatedText}
                                        onChange={(e) => setUpdatedText(e.target.value)}
                                    />
                                    <button className="save-btn" onClick={() => handleSave(timestamp)}>Save</button>
                                    <button className="cancel-btn" onClick={() => setEditing(null)}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <p><strong>{new Date(timestamp).toLocaleString()}:</strong> {text}</p>
                                    <button className="edit-btn" onClick={() => handleEdit(timestamp, text)}>Edit</button>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SavedTranscriptPage;