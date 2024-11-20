import React, { useState, useEffect, useRef } from "react";

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null); // Reference to the media stream

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      stopMic();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Access the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream; // Save the stream for later use
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Collect audio chunks as the recording progresses
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Handle the end of the recording
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        audioChunksRef.current = [];
        stopMic(); // Stop the microphone after recording finishes
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Error accessing microphone. Please ensure permissions are granted.");
    }
  };

  const stopMic = () => {
    // Stop the media stream and the tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null; // Clear the stream reference
    }
  };

  const saveRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.wav"; // Set the file name here
      a.click();
      URL.revokeObjectURL(url); // Revoke the URL to free memory

      // Redirect to a specific webpage after 3 seconds
      setTimeout(() => {
        window.location.href = "https://forms.gle/x3dZ83CkzvgmXAQr6"; // Replace with your desired URL
      }, 3000);
    }
  };

  return (
    <div className="voice-recorder">
      <button
        onClick={() => setIsRecording(!isRecording)}
        style={{
          backgroundColor: isRecording ? "#ff6347" : "#4caf50",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioBlob && !isRecording && (
        <button
          onClick={saveRecording}
          style={{
            backgroundColor: "#4caf50",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Save Recording
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
