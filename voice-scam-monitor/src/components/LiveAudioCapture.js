import React, { useState, useEffect, useRef } from "react";

export async function getElevenLabsTTS(text) {
  const apiKey = "sk_450dde72973f75305415e61276a75dd74d0813da8835fadd";
  const voiceId = "21m00Tcm4TlvDq8ikWAM";

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: text,
      voice_settings: { stability: 0.75, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    throw new Error("Error calling ElevenLabs TTS");
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}

function downsampleBuffer(buffer, sampleRate, outSampleRate) {
  if (outSampleRate === sampleRate) return buffer;
  const sampleRateRatio = sampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0,
    offsetBuffer = 0;
  while (offsetResult < newLength) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0,
      count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function floatTo16BitPCM(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

const colors = {
  darkBg: "#0f1218",
  accentBlue: "#3a7bfd",
  accentGreen: "#3bd972",
  accentYellow: "#e7ba44",
  textLight: "#f0f0f3",
  textMuted: "#a5a8b1",
  warningOrange: "#ffaf33",
  dangerRed: "#ff5c5c",
  callBg: "#1e2430",
};

const LiveAudioCapture = () => {
  const [transcript, setTranscript] = useState("");
  const [label, setLabel] = useState("Safe");
  const [rationale, setRationale] = useState("");
  const [scamCount, setScamCount] = useState(0);
  const [callActive, setCallActive] = useState(false);

  const keywordCount = useRef(0);
  const prevLabel = useRef(null);
  const ws = useRef(null);
  const audioContext = useRef(null);
  const processor = useRef(null);
  const source = useRef(null);
  const audioRef = useRef(null);

  const playTTSMessage = async (text) => {
    try {
      const audioUrl = await getElevenLabsTTS(text);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error in TTS:", error);
    }
  };

  const startCall = () => {
    setCallActive(true);
    setTranscript("");
    setLabel("Safe");
    setRationale("");
    keywordCount.current = 0;
    prevLabel.current = null;
    setScamCount(0);

    ws.current = new WebSocket("ws://localhost:8000/ws/audio");

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.partial) setTranscript(data.partial);

        if (data.label) {
          setLabel(data.label);

          const labelLower = data.label.toLowerCase();

          if (labelLower === "scam" && prevLabel.current !== "scam") {
            keywordCount.current += 1;
            setScamCount(keywordCount.current);

            if (keywordCount.current === 3) {
              playTTSMessage("This call is suspicious.");
            } else if (keywordCount.current > 3) {
              playTTSMessage("This call is potentially dangerous.");
            }
          }

          prevLabel.current = labelLower;
        }

        if (data.rationale) setRationale(data.rationale);
      } catch (e) {
        console.error("Error parsing WS message:", e);
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext.current = new AudioContext();
        source.current = audioContext.current.createMediaStreamSource(stream);
        processor.current = audioContext.current.createScriptProcessor(2048, 1, 1);

        source.current.connect(processor.current);
        processor.current.connect(audioContext.current.destination);

        processor.current.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(inputData, audioContext.current.sampleRate, 16000);
          const int16Data = floatTo16BitPCM(downsampled);

          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(int16Data.buffer);
          }
        };
      })
      .catch((err) => {
        console.error("Could not access microphone:", err);
      });
  };

  const endCall = () => {
    setCallActive(false);
    setTranscript("");
    setLabel("Safe");
    setRationale("");
    setScamCount(0);
    keywordCount.current = 0;
    prevLabel.current = null;

    if (processor.current) {
      processor.current.disconnect();
      processor.current.onaudioprocess = null;
    }
    if (source.current) source.current.disconnect();
    if (audioContext.current) audioContext.current.close();
    if (ws.current) ws.current.close();
  };

  const renderWarningMessage = () => {
    if (scamCount === 0) {
      return <p style={{ color: colors.accentGreen, fontWeight: "600", fontSize: "1.1rem" }}>This call is safe.</p>;
    }
    if (scamCount > 0 && scamCount < 3) {
      return <p style={{ color: colors.accentYellow, fontWeight: "600", fontSize: "1.1rem" }}>Some suspicious words detected.</p>;
    }
    if (scamCount === 3) {
      return <p style={{ color: colors.warningOrange, fontWeight: "700", fontSize: "1.2rem" }}>⚠️ This call is suspicious.</p>;
    }
    if (scamCount > 3) {
      return <p style={{ color: colors.dangerRed, fontWeight: "700", fontSize: "1.3rem" }}>⚠️ This call is potentially dangerous.</p>;
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.darkBg,
        minHeight: "100vh",
        color: colors.textLight,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <h1 style={{ marginBottom: 10, fontWeight: "700" }}>ScamShield AI</h1>
        <p style={{ color: colors.textMuted, marginBottom: 40 }}>
          Real-time scam detection powered by AI
          <br />
          Protect your calls by detecting fraud in real time.
        </p>

        {!callActive && (
          <button
            style={{
              backgroundColor: colors.accentBlue,
              color: "#fff",
              border: "none",
              padding: "12px 30px",
              borderRadius: 25,
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
              boxShadow: "0 4px 14px rgb(58 127 253 / 0.5)",
              marginBottom: 40,
              transition: "background-color 0.3s ease",
            }}
            onClick={startCall}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d61f6")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.accentBlue)}
          >
            Answer Call
          </button>
        )}

        {callActive && (
          <div
            style={{
              backgroundColor: colors.callBg,
              borderRadius: 15,
              padding: 20,
              boxShadow: "0 8px 24px rgb(0 0 0 / 0.3)",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            <p style={{ fontWeight: "600", fontSize: 18, marginBottom: 10, color: colors.textLight }}>
              Transcript:
            </p>
            <div
              style={{
                backgroundColor: "#10131a",
                borderRadius: 12,
                padding: 15,
                minHeight: 100,
                fontSize: 16,
                color: colors.textMuted,
                overflowY: "auto",
                maxHeight: 150,
                marginBottom: 20,
                userSelect: "text",
                whiteSpace: "pre-wrap",
              }}
            >
              {transcript || "Listening..."}
            </div>

            <div style={{ fontSize: 18, marginBottom: 10 }}>
              <strong>Status: </strong>
              <span
                style={{
                  color:
                    label.toLowerCase() === "scam"
                      ? colors.warningOrange
                      : label.toLowerCase() === "safe"
                      ? colors.accentGreen
                      : colors.accentYellow,
                  fontWeight: "700",
                }}
              >
                {label} ({scamCount} times "scam")
              </span>
            </div>

            <p style={{ fontSize: 14, fontStyle: "italic", marginBottom: 20, color: colors.textMuted }}>
              <strong>Reason: </strong>
              {rationale || "No suspicious signals detected."}
            </p>

            {renderWarningMessage()}

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={endCall}
                style={{
                  backgroundColor: colors.dangerRed,
                  color: "#fff",
                  border: "none",
                  padding: "12px 30px",
                  borderRadius: 25,
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "1rem",
                  boxShadow: "0 4px 14px rgb(255 92 92 / 0.6)",
                  transition: "background-color 0.3s ease",
                  marginRight: scamCount > 3 ? 12 : 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e04747")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.dangerRed)}
              >
                Hang Up
              </button>

              {scamCount > 3 && (
                <button
                  onClick={() => alert("Call reported as fraud")}
                  style={{
                    backgroundColor: colors.warningOrange,
                    color: "#fff",
                    border: "none",
                    padding: "12px 30px",
                    borderRadius: 25,
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "1rem",
                    boxShadow: "0 4px 14px rgb(255 175 51 / 0.8)",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d68600")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.warningOrange)}
                >
                  Report as Fraud
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
};

export default LiveAudioCapture;
