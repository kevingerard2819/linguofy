import React, { useState, useRef } from 'react';
import './Agent.css';
import { useEffect } from 'react';
import { FaVolumeUp, FaStop } from 'react-icons/fa';


const Agent = () => {
    const [recording, setRecording] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const chatWindowRef = useRef(null);
    const [prompt, setPrompt] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);


    function formatText(text) {
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/(?:^|\n)[\*\-] (.*?)(?=\n|$)/g, '<li>$1</li>');
        text = text.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
        text = text.replace(/\n{2,}/g, '<br/><br/>');
        return text;
    }
    const speakText = (text) => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech not supported in this browser.');
            return;
        }

        if (speaking) {

            window.speechSynthesis.cancel();
            setSpeaking(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';

            utterance.onend = () => {
                setSpeaking(false);
            };

            utterance.onerror = () => {
                setSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
            setSpeaking(true);
        }
    };


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = handleRecordingStop;
            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

 
    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    
    const handleRecordingStop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToServer(audioBlob, 'webm');
    };

   
    const sendAudioToServer = async (audioBlob, extension) => {
        console.log("Sending blob to server, size:", audioBlob.size, "Extension:", extension);
        const formData = new FormData();
        formData.append("file", audioBlob, `recording.${extension}`);

        try {
            const response = await fetch("http://127.0.0.1:5000/agent", {
                method: "POST",
                body: formData,
            });
            console.log("Response received from backend:", response);
            const data = await response.json();
            

            if (data.answer) {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'user', text: data.question },
                    { sender: 'bot', text: data.answer }
                ]);
                setPrompt('');
            
            } else {
                console.log("No answer in response:", data);
            }
        } catch (error) {
            console.error("Error sending audio to server:", error);
        }
    };

    const sendPromptToServer = async () => {
        if (!prompt.trim()) return;
        setMessages((prev) => [
            ...prev,
            { sender: 'user', text: prompt },
        ]);
        setPrompt("");
        try {
            const response = await fetch("http://127.0.0.1:5000/agenttext", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });
            const data = await response.json();
            if (data.answer) {
                setMessages((prev) => [
                    ...prev,
                    { sender: 'bot', text: data.answer }
                ]);
                setPrompt('');
            } else {
                console.log("No translation in response:", data);
            }
        } catch (error) {
            console.error("Error sending prompt to server:", error);
        }
    };

    const handleButtonClick = () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="agent-container">
            <div className="agent-transcription">

                <div className="agent-transcription chat-window" ref={chatWindowRef}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}
                        >
                            <div className="message-text">
                                {msg.sender === 'bot' ? (
                                    <>
                                        <div
                                            className="formatted-text"
                                            dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
                                        />
                                        <button
                                            className="speak-button"
                                            onClick={() => speakText(msg.text)}
                                            title="Play audio"
                                        >
                                            {speaking ? <FaStop size={16}  /> : <FaVolumeUp size={16} />}
                                        </button>
                                    </>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="agent-footer">
                <div className="agent-input-section">
                    <input
                        type="text"
                        placeholder="Type your question..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="agent-text-input"
                    />
                    <button onClick={sendPromptToServer} className="agent-send-button">
                        Send
                    </button>
                </div>

                <button
                    className={`agent-button ${recording ? 'recording' : ''}`}
                    onClick={handleButtonClick}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path d="M8 11a3 3 0 0 0 3-3V3a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" />
                    </svg>
                </button>
            </div>
        </div>
    );

};

export default Agent;



