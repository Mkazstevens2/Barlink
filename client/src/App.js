import React, { useEffect, useState, useRef } from "react";
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
  const [image, setImage] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [joined, setJoined] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!joined) return;

    socket.emit("joinBar", bar);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, { ...data, type: "text" }]);
    });

    socket.on("newImage", (data) => {
      setMessages((prev) => [...prev, { ...data, type: "image" }]);
    });

    socket.on("userTyping", (typingName) => {
      setTypingUsers((prev) => ({ ...prev, [typingName]: true }));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[typingName];
          return updated;
        }, 3000);
      });
    });

    socket.on("userStopTyping", (typingName) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[typingName];
        return updated;
      });
    });

    return () => {
      socket.off("newMessage");
      socket.off("newImage");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [joined, bar]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const formattedMessage = Object.keys(EMOJI_MAP).reduce(
      (msg, key) => msg.split(key).join(EMOJI_MAP[key]),
      message
    );

    const data = {
      name,
      age,
      gender,
      bar,
      text: formattedMessage,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Chicago",
      }),
    };

    socket.emit("sendMessage", data);
    setMessage("");
    socket.emit("stopTyping", { bar, name });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("https://barlink-6oru.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    socket.emit("sendImage", {
      name,
      age,
      gender,
      bar,
      imageUrl: data.url,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Chicago",
      }),
    });

    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleTyping = () => {
    socket.emit("typing", { name, bar });
  };

  if (!joined) {
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
        <button onClick={() => setJoined(true)}>Enter Chat</button>
      </div>
    );
  }

  return (
    <div className="chat">
      <h2>BarLink Chat</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} style={{ color: GENDER_COLORS[msg.gender] || "black" }}>
            <strong>
              {msg.name} ({msg.age})
            </strong>{" "}
            [{msg.timestamp}]:
            {msg.type === "text" && <span> {msg.text}</span>}
            {msg.type === "image" && (
              <div>
                <img src={msg.imageUrl} alt="upload" style={{ maxWidth: "200px" }} />
              </div>
            )}
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
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} />
      </div>
    </div>
  );
};

export default App;
