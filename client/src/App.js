                import React, { useEffect, useState } from "react";
                import io from "socket.io-client";

                const socket = io("https://barlink-6oru.onrender.com");

                const GENDER_COLORS = {
                  Male: "blue",
                  Female: "pink",
                  Other: "darkgreen",
                };

                const EMOJI_MAP = {
                  ":fire:": "🔥",
                  ":heart:": "❤️",
                  ":laughing:": "😆",
                  ":beer:": "🍺",
                  ":thumbsup:": "👍",
                  ":100:": "💯",
                };

                const App = () => {
                  const [name, setName] = useState("");
                  const [age, setAge] = useState("");
                  const [gender, setGender] = useState("Male");
                  const [bar, setBar] = useState("");
                  const [message, setMessage] = useState("");
                  const [messages, setMessages] = useState([]);
                  const [typingUsers, setTypingUsers] = useState({});

                  useEffect(() => {
                    socket.on("chat message", (data) => {
                      setMessages((prev) => [...prev, data]);
                    });

                    socket.on("typing", ({ name }) => {
                      setTypingUsers((prev) => ({ ...prev, [name]: true }));

                      setTimeout(() => {
                        setTypingUsers((prev) => {
                          const updated = { ...prev };
                          delete updated[name];
                          return updated;
                        });
                      }, 3000);
                    });

                    return () => {
                      socket.off("chat message");
                      socket.off("typing");
                    };
                  }, []);

                  const handleSendMessage = () => {
                    if (message.trim() !== "") {
                      const formattedMessage = Object.keys(EMOJI_MAP).reduce((msg, key) => {
                        return msg.split(key).join(EMOJI_MAP[key]);
                      }, message);

                      const data = {
                        name,
                        age,
                        gender,
                        bar,
                        message: formattedMessage,
                        timestamp: new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "America/Chicago",
                        }),
                      };

                      socket.emit("chat message", data);
                      setMessage("");
                    }
                  };

                  const handleTyping = () => {
                    socket.emit("typing", { name });
                  };

                  if (!name || !age || !gender || !bar) {
                    return (
                      <div className="setup">
                        <h2>Enter your info</h2>
                        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                        <input
                          placeholder="Age"
                          value={age}
                          type="number"
                          onChange={(e) => setAge(e.target.value)}
                        />
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                        <input
                          placeholder="Bar Location"
                          value={bar}
                          onChange={(e) => setBar(e.target.value)}
                        />
                        <button onClick={() => {}}>Enter Chat</button>
                      </div>
                    );
                  }

                  return (
                    <div className="chat">
                      <h2>BarLink Chat</h2>
                      <div className="messages">
                        {messages
                          .filter((msg) => msg.bar === bar)
                          .map((msg, index) => (
                            <div key={index} style={{ color: GENDER_COLORS[msg.gender] || "black" }}>
                              <strong>
                                {msg.name} ({msg.age})
                              </strong>{" "}
                              [{msg.timestamp}]: {msg.message}
                            </div>
                          ))}
                        {Object.keys(typingUsers).map((username, index) => (
                          <div key={`typing-${index}`} style={{ fontStyle: "italic", color: "gray" }}>
                            {username} is typing...
                          </div>
                        ))}
                      </div>
                      <div className="input">
                        <input
                          placeholder="Type a message..."
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            handleTyping();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendMessage();
                          }}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                      </div>
                    </div>
                  );
                };

                export default App;
