import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.svg";
import "./LandingPage.css";

const LandingPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [microphoneAllowed, setMicrophoneAllowed] = useState(false);
    const [selectedModel, setSelectedModel] = useState("custom");

    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const stopIntervalRef = useRef(null);
    const chunksRef = useRef([]);

    const sendAudioToServer = async (audioBlob, extension) => {
        console.log("Sending blob to server, size:", audioBlob.size, "Extension:", extension);
        const formData = new FormData();
        formData.append("file", audioBlob, `recording.${extension}`);

        try {
            const response = await fetch("http://127.0.0.1:5000/transcribe", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (data.transcription) {
                console.log("Transcription received:", data.transcription);
                setTranscription((prev) => prev + " " + data.transcription);
            } else {
                console.log("No transcription in response:", data);
            }
        } catch (error) {
            console.error("Error sending audio to server:", error);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setMicrophoneAllowed(true);

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            let options = {};
            if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
                options.mimeType = "audio/webm;codecs=opus";
            } else {
                console.warn("audio/webm;codecs=opus not supported; using default");
            }

            mediaRecorderRef.current = new MediaRecorder(stream, options);

            // Reset chunks
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                if (chunksRef.current.length > 0) {
                    const audioBlob = new Blob(chunksRef.current, {
                        type: mediaRecorderRef.current.mimeType || "audio/webm"
                    });

                    const extension = mediaRecorderRef.current.mimeType.includes("webm") ? "webm" : "wav";
                    await sendAudioToServer(audioBlob, extension);


                    chunksRef.current = [];
                }
            };


            mediaRecorderRef.current.start();
            setIsRecording(true);


            stopIntervalRef.current = setInterval(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop();
                    mediaRecorderRef.current.start();
                }
            }, 3000);

            startVisualization();
        } catch (error) {
            console.error("Error during audio initialization:", error);
            alert("Microphone access is required for this app to work.");
        }
    };

    const stopRecording = () => {

        if (stopIntervalRef.current) {
            clearInterval(stopIntervalRef.current);
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        setIsRecording(false);
    };

    const startVisualization = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const analyser = analyserRef.current;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            ctx.fillStyle = "#2a2a2a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#2196f3";
            ctx.beginPath();
            const sliceWidth = canvas.width / dataArray.length;
            let x = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };
        draw();
    };

    const handleToggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        const updateCanvasSize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
        };
        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);
        return () => window.removeEventListener("resize", updateCanvasSize);
    }, []);

    const handleClearTranscription = () => {
        setTranscription("");
    };

    const handleTranslate = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/translate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transcription: transcription,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to translate');
            }

            const data = await response.json();
            setTranscription(data.Translation)
            alert("Translated and reformated to English!");
        } catch (error) {
            console.error("Error translating:", error);
            alert("Failed to translate!");
        }
    };

    const handleSaveTranscription = async () => {
        try {
            const email = sessionStorage.getItem('email');
            const response = await fetch("http://127.0.0.1:5000/save_transcription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transcription: transcription,
                    email: email
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save transcription');
            }

            const data = await response.json();
            alert("Transcription saved successfully!");
            setTranscription("")
            window.location.reload();
        } catch (error) {
            console.error("Error saving transcription:", error);
            alert("Failed to save transcription");
        }
    };

    return (
        <div className="container">
            {/* <div className="visualizer-container">
                <canvas ref={canvasRef} className="audio-visualizer" />
                <button
                    onClick={handleToggleRecording}
                    className={`recordButton ${isRecording ? 'recording' : ''}`}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div> */}
            <div className="visualizer-container" style={{ flexDirection: "column" }}>
                <canvas ref={canvasRef} className="audio-visualizer" />
                <button
                    onClick={handleToggleRecording}
                    className={`recordButton ${isRecording ? 'recording' : ''}`}
                >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
            </div>
            <div className="bottomSection">
                <div className="box transcription-box">
                    <h3>Transcription</h3>
                    <textarea
                        className="textArea"
                        value={transcription}
                        readOnly
                        placeholder="Transcription will appear here..."
                    />
                    <div className="button-container">
                        <button
                            onClick={handleClearTranscription}
                            className="actionButton clearButton"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleSaveTranscription}
                            className="actionButton saveButton"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleTranslate}
                            className="actionButton translateButton"
                        >
                            Translate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;