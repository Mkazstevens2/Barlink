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

        // 🔧 Resize image before uploading (faster send)
        const resizeImage = (file, maxWidth = 800) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                const scale = Math.min(1, maxWidth / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                  resolve(new File([blob], file.name, { type: file.type }));
                }, file.type);
              };
              img.src = event.target.result;
            };
            reader.readAsDataURL(file);
          });

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
          const [isSending, setIsSending] = useState(false);
          const [typingUsers, setTypingUsers] = useState([]);
          const [polls, setPolls] = useState([]);
          const [currentPoll, setCurrentPoll] = useState({ question: "", options: ["", ""] });

          useEffect(() => {
            if (form.bar) socket.emit("joinBar", form.bar);

            socket.on("newMessage", (data) => {
              setMessages((prev) => [...prev, data]);
            });

            socket.on("newImage", (data) => {
              setMessages((prev) => [...prev, data]);
            });

            socket.on("userTyping", (name) => {
              setTypingUsers((prev) => [...new Set([...prev, name])]);
            });

            socket.on("userStopTyping", (name) => {
              setTypingUsers((prev) => prev.filter((n) => n !== name));
            });

            socket.on("newPoll", (poll) => {
              setPolls((prev) => [...prev, { ...poll, votes: [0, 0] }]);
            });

            socket.on("pollVote", ({ pollIndex, optionIndex }) => {
              setPolls((prev) => {
                const updatedPolls = [...prev];
                if (updatedPolls[pollIndex]) {
                  updatedPolls[pollIndex].votes[optionIndex] += 1;
                }
                return updatedPolls;
              });
            });

            return () => {
              socket.off("newMessage");
              socket.off("newImage");
              socket.off("userTyping");
              socket.off("userStopTyping");
              socket.off("newPoll");
              socket.off("pollVote");
            };
          }, [form.bar]);

          const convertEmojis = (text) => {
            return text.replace(/:\w+?:/g, (match) => EMOJI_MAP[match] || match);
          };

          const handleImageUpload = async () => {
            if (!image) return null;
            const resized = await resizeImage(image);
            const formData = new FormData();
            formData.append("image", resized);

            const res = await fetch("https://barlink-6oru.onrender.com/upload", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();
            return data.url;
          };

          const handleSend = async () => {
            setIsSending(true);
            const imageUrl = await handleImageUpload();
            const now = new Date().toLocaleTimeString("en-US", {
              timeZone: "America/Chicago",
              hour: "numeric",
              minute: "2-digit",
            });

            if (imageUrl) {
              const imageData = {
                name: userInfo.name,
                age: userInfo.age,
                gender: userInfo.gender,
                bar: userInfo.bar,
                image: imageUrl,
                time: now,
              };
              socket.emit("sendImage", imageData);
            }

            if (message) {
              const messageData = {
                name: userInfo.name,
                age: userInfo.age,
                gender: userInfo.gender,
                bar: userInfo.bar,
                text: convertEmojis(message),
                time: now,
              };
              socket.emit("sendMessage", messageData);
            }

            setMessage("");
            setImage(null);
            setIsSending(false);
            socket.emit("stopTyping", { bar: userInfo.bar, name: userInfo.name });
          };

          const handleTyping = (e) => {
            setMessage(e.target.value);
            socket.emit("typing", { bar: userInfo.bar, name: userInfo.name });
          };

          const handlePollCreation = () => {
            if (currentPoll.question && currentPoll.options.every((opt) => opt)) {
              const poll = {
                ...currentPoll,
                bar: userInfo.bar,
              };
              socket.emit("createPoll", poll);
              setCurrentPoll({ question: "", options: ["", ""] });
            }
          };

          const handleVote = (pollIndex, optionIndex) => {
            socket.emit("votePoll", { bar: userInfo.bar, pollIndex, optionIndex });
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
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  placeholder="Age"
                  type="number"
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
                <select onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <select
                  onChange
        ::contentReference[oaicite:0]{index=0}

