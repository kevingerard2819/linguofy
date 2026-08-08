import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./HistorySinglePage.css";

const SingleHistoryEntry = () => {
    const { timestamp } = useParams();
    const [text, setText] = useState("");
    const [editing, setEditing] = useState(false);
    const [updatedText, setUpdatedText] = useState("");
    const userEmail = sessionStorage.getItem("email");
    const [copyButton, setCopyButton] = useState("Copy");
    

    useEffect(() => {
        if (userEmail && timestamp) {
            fetch("http://127.0.0.1:5000/get_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail }),
            })
                .then((res) => res.json())
                .then((data) => {
                    const entry = data.history?.[timestamp];
                    if (entry) {
                        setText(entry);
                        setUpdatedText(entry);
                    }
                });
        }
    }, [userEmail, timestamp]);

    const handleSave = async () => {
        const res = await fetch("http://127.0.0.1:5000/update_history", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: userEmail,
                timestamp,
                updated_summary: updatedText,
            }),
        });

        if (res.ok) {
            setText(updatedText);
            setEditing(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyButton("Copied!");
            setTimeout(() => setCopyButton("Copy"), 500);
        }
        ).catch((err) => {
            console.error("Failed to copy text: ", err);
        });
    };

    if (!text) return <div className="entry-container">Loading...</div>;

    return (
        <div className="entry-container">
            <h2>Transcription from {new Date(timestamp).toLocaleString()}</h2>
            {editing ? (
                <>
                    <textarea
                        className="entry-textarea"
                        value={updatedText}
                        onChange={(e) => {
                            setUpdatedText(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 350)}px`;
                        }}
                    />
                    <button className="entry-btn cancel" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="entry-btn save" onClick={handleSave}>Save</button>
                </>
            ) : (
                <>
                    <p className="entry-text">{text}</p>
                    <button className="entry-btn edit" onClick={() => setEditing(true)}>Edit</button>
                    <button className="entry-btn copy" onClick={() => copyToClipboard()}>{copyButton}</button>
                </>
            )}
        </div>
    );
};

export default SingleHistoryEntry;
