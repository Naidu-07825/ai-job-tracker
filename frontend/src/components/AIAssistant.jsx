import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";

export default function AIAssistant({ filters = {}, setFilters = () => {}, onFilterUpdate = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      type: "assistant",
      content:
        "👋 Hi! I'm your AI Job Assistant. I can help you search for jobs using natural language. Try asking me things like: 'Show me React developer jobs with Node.js' or 'Find remote positions'",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const userId = "default-user"; // In production, use actual user ID from auth
  const [chatSize, setChatSize] = useState({ width: 420, height: 600 });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Responsive chat sizing (mobile-first)
  useEffect(() => {
    function updateSize() {
      const w = window.innerWidth || 360;
      if (w < 480) {
        setChatSize({ width: Math.floor(w * 0.94), height: Math.floor(window.innerHeight * 0.6) });
      } else if (w < 900) {
        setChatSize({ width: 420, height: Math.floor(window.innerHeight * 0.7) });
      } else {
        setChatSize({ width: 520, height: Math.floor(window.innerHeight * 0.75) });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Initialize SpeechRecognition if available; enable interim results for live transcript
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportsSpeech(false);
      return;
    }
    setSupportsSpeech(true);

    const recog = new SpeechRecognition();
    recog.lang = navigator.language || "en-US";
    recog.interimResults = true;
    recog.continuous = false;

    recog.onstart = () => {
      setPermissionDenied(false);
      setIsListening(true);
      setInterimTranscript("");
    };

    recog.onresult = (ev) => {
      let interim = "";
      let finalTranscript = "";
      for (let i = ev.resultIndex; i < ev.results.length; ++i) {
        const res = ev.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      if (interim) setInterimTranscript(interim.trim());

      if (finalTranscript) {
        const text = finalTranscript.trim();
        setInterimTranscript("");
        setInputValue(text);
        // auto send final result
        handleSendMessage(text);
      }
    };

    recog.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recog.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
      if (e && (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "permission_denied")) {
        setPermissionDenied(true);
      }
    };

    recognitionRef.current = recog;
    return () => {
      try { recog.stop(); } catch (e) {}
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    const recog = recognitionRef.current;
    if (!recog) return;
    if (isListening) {
      try { recog.stop(); } catch (e) {}
      setIsListening(false);
    } else {
      try { recog.start(); setIsListening(true); } catch (e) { console.error(e); }
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await api.get("/ai/suggestions");
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  const processChatMessage = (toolActions) => {
    // Process tool actions to update filters
    const filterUpdates = {};
    let shouldSearch = false;

    for (const action of toolActions) {
      if (action.result?.type === "update_filters") {
        const filters = action.result.filters;
        if (action.result.action === "clear_all") {
          // Clear all filters
          filterUpdates.title = "";
          filterUpdates.location = "";
          filterUpdates.workMode = "all";
          filterUpdates.datePosted = "any";
          filterUpdates.match = "all";
          filterUpdates.jobType = "all";
          filterUpdates.skills = "";
          shouldSearch = true;
        } else {
          // Set specific filters
          Object.assign(filterUpdates, filters);
          shouldSearch = true;
        }
      } else if (action.result?.type === "search") {
        // Extract filter values from search action
        const searchFilters = action.result.filters;
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value !== null) {
            filterUpdates[key] = value;
          }
        });
        shouldSearch = true;
      }
    }

    if (shouldSearch && Object.keys(filterUpdates).length > 0) {
      setFilters((prev) => ({ ...prev, ...filterUpdates }));
      onFilterUpdate(filterUpdates);
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Clear input
    setInputValue("");

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Set loading state
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: message,
        userId: userId,
      });

      if (response.data.success) {
        // Add assistant response
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: response.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Process tool actions
        if (response.data.toolActions && response.data.toolActions.length > 0) {
          processChatMessage(response.data.toolActions);
        }
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: "error",
          content: "❌ " + (response.data.error || "Failed to process your message"),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: "❌ Error: " + (error.response?.data?.error || error.message),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          fontFamily: "inherit",
        }}
      >
        {/* Chat Window */}
        {isOpen && (
          <div
              style={{
              position: "absolute",
              bottom: "70px",
              right: "0",
              width: `${chatSize.width}px`,
              height: `${chatSize.height}px`,
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 5px 40px rgba(0, 0, 0, 0.16)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            <style>
              {`
                @keyframes slideUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}
            </style>

            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}>
                  🤖 AI Job Assistant
                </h3>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.9 }}>
                  Ask me anything about jobs
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.type}`}
                  style={{
                    display: "flex",
                    justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      wordWrap: "break-word",
                      background:
                        msg.type === "user"
                          ? "#667eea"
                          : msg.type === "error"
                            ? "#fee2e2"
                            : "#f3f4f6",
                      color:
                        msg.type === "user" ? "white" : msg.type === "error" ? "#dc2626" : "#1f2937",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#999",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>AI is thinking</span>
                  <span style={{ animation: "blink 1.4s infinite", fontSize: "16px" }}>
                    ●
                  </span>
                  <style>
                    {`
                      @keyframes blink {
                        0%, 20%, 50%, 80%, 100% { opacity: 1; }
                        40% { opacity: 0.5; }
                        60% { opacity: 0.7; }
                      }
                    `}
                  </style>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (show when no messages beyond welcome) */}
            {messages.length === 1 && suggestions.length > 0 && (
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e5e7eb",
                  maxHeight: "120px",
                  overflowY: "auto",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "11px", fontWeight: "600", color: "#6b7280" }}>
                  SUGGESTIONS:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {suggestions.slice(0, 3).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                        color: "#374151",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#667eea";
                        e.target.style.color = "white";
                        e.target.style.borderColor = "#667eea";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#f9fafb";
                        e.target.style.color = "#374151";
                        e.target.style.borderColor = "#e5e7eb";
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                padding: "12px",
                display: "flex",
                gap: "8px",
                background: "#fafafa",
              }}
            >
              {/* Live transcript / permission UI */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                {permissionDenied ? (
                  <div className="mic-permission" role="status">
                    Voice access was blocked. Allow microphone access in your browser settings and retry.
                  </div>
                ) : (!supportsSpeech ? (
                  <div className="mic-permission mic-disabled" role="status">
                    Voice input not supported in this browser.
                  </div>
                ) : (isListening || interimTranscript) && (
                  <div className="transcript" aria-live="polite">
                    {interimTranscript ? <div className="interim">{interimTranscript}</div> : null}
                    <div className="final" style={{ display: 'none' }} />
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              />
              <button
                onClick={toggleListening}
                title={isListening ? "Stop recording" : "Record voice"}
                aria-pressed={isListening}
                className={`mic-btn ${isListening ? 'recording' : ''}`}
                style={{ alignSelf: 'center' }}
              >
                {isListening ? '⏺️' : '🎙️'}
                <span className="sr-only">{isListening ? 'Stop voice input' : 'Start voice input'}</span>
              </button>

              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                style={{
                  padding: "10px 14px",
                  background: isLoading || !inputValue.trim() ? "#d1d5db" : "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && inputValue.trim()) {
                    e.target.style.background = "#5568d3";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && inputValue.trim()) {
                    e.target.style.background = "#667eea";
                  }
                }}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
          }}
        >
          {isOpen ? "✕" : "💬"}
        </button>
      </div>
    </>
  );
}