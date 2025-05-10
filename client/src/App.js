import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://barlink-6oru.onrender.com"); // ✅ Render deployment domain

const GENDER_COLORS = {
  Male: "blue",
  Female: "pink",
  Other: "darkgreen",
};

// Emoji mapping
const EMOJI_MAP = {
  ":fire:": "🔥",
  ":heart:": "❤️",
  ":laughing:": "😆",
  ":beer:": "🍺",
  ":thumbsup:": "👍",
  ":100:": "💯",
};

const CITIES = {
  Chicago: {
    "Lincoln Park": ["The Galway Arms", "Old Grounds Social"],
    "Wicker Park": ["The Violet Hour", "Emporium"],
  },
  Austin: {
    Downtown: ["The Roosevelt Room", "Barbarella"],
    "East Side": ["Whisler's", "The White Horse"],
  },
};

const App = () => {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    neighborhood: "",
    bar: "",
  });
  const [userInfo, setUserInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (form.bar) socket.emit("joinBar", form.bar);

    socket.on("newMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("newMessage");
  }, [form.bar]);

  const convertEmojis = (text) => {
    return text.replace(/:\w+?:/g, (match) => EMOJI_MAP[match] || match);
  };

  const handleImageUpload = async () => {
    if (!image) return null;
    const formData = new FormData();
    formData.append("image", image);

    const res = await fetch("https://barlink-6oru.onrender.com/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  const handleSend = async () => {
    const imageUrl = await handleImageUpload();
    if (!message && !imageUrl) return;

    const now = new Date().toLocaleTimeString("en-US", {
      timeZone: "America/Chicago",
      hour: "numeric",
      minute: "2-digit",
    });

    const data = {
      name: userInfo.name,
      age: userInfo.age,
      gender: userInfo.gender,
      bar: userInfo.bar,
      text: convertEmojis(message),
      image: imageUrl || null,
      time: now,
    };

    socket.emit("sendMessage", data);
    setMessage("");
    setImage(null);
  };

  if (!userInfo) {
    const cityList = Object.keys(CITIES);
    const neighborhoodList = form.city ? Object.keys(CITIES[form.city]) : [];
    const barList =
      form.city && form.neighborhood
        ? CITIES[form.city][form.neighborhood]
        : [];

    return (
      <div style={{ padding: 20 }}>
        <h2>Welcome to BarLink 🍻</h2>
        <p>Set up your profile:</p>

        <input
          placeholder="Name"
          autoComplete="off"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Age"
          type="number"
          autoComplete="off"
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <select onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <select
          onChange={(e) =>
            setForm({ ...form, city: e.target.value, neighborhood: "", bar: "" })
          }
        >
          <option value="">Select City</option>
          {cityList.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>

        <select
          disabled={!form.city}
          onChange={(e) =>
            setForm({ ...form, neighborhood: e.target.value, bar: "" })
          }
        >
          <option value="">Select Neighborhood</option>
          {neighborhoodList.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>

        <select
          disabled={!form.neighborhood}
          onChange={(e) => setForm({ ...form, bar: e.target.value })}
        >
          <option value="">Select Bar</option>
          {barList.map((bar) => (
            <option key={bar}>{bar}</option>
          ))}
        </select>

        <button
          disabled={
            !form.name ||
            !form.age ||
            !form.gender ||
            !form.city ||
            !form.neighborhood ||
            !form.bar
          }
          onClick={() => setUserInfo(form)}
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Live Chat at {userInfo.bar}</h2>
      <div
        style={{
          maxHeight: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              color: GENDER_COLORS[msg.gender] || "black",
              marginBottom: 10,
            }}
          >
            <strong>{msg.name}:</strong> {msg.text}
            {msg.image && (
              <div>
                <img
                  src={msg.image}
                  alt="upload"
                  style={{ width: "150px", marginTop: 5 }}
                />
              </div>
            )}
            <div style={{ fontSize: "0.8em", color: "#888" }}>{msg.time}</div>
          </div>
        ))}
      </div>

      <input
        value={message}
        placeholder="Type a message"
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "60%" }}
      />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default App;
