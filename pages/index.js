import { useState, useRef, useEffect } from "react";
import { signIn, useSession, signOut } from "next-auth/react"; // Importing NextAuth hooks

export default function Home() {
    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState([]);
    const { data: session } = useSession(); // Get session info
    const chatContainerRef = useRef(null);

    // Hardcoding the model to "llama-3.2-90b-vision-preview"
    const selectedModel = "llama-3.2-90b-vision-preview";

    // Load chat history from Local Storage or a database if logged in
    useEffect(() => {
        if (session) {
            // Load chat history from localStorage
            const history = localStorage.getItem(session.user.email);
            if (history) {
                setMessages(JSON.parse(history)); // Restore history from Local Storage
            }
        }
    }, [session]);

    const sendMessage = async () => {
        if (!userInput.trim()) return;

        setMessages(prev => [...prev, { role: "user", content: userInput }]);

        try {
            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        messages: [
                            {
                                role: "system",
                                content:
                                    "You are an AI assistant named Dani. When asked about your name, you should respond that your name is Dani."
                            },
                            { role: "user", content: userInput }
                        ]
                    })
                }
            );

            const data = await response.json();
            const aiResponse =
                data.choices?.[0]?.message?.content || "No response available.";

            setMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
            // Save the updated chat history to Local Storage
            if (session) {
                localStorage.setItem(
                    session.user.email,
                    JSON.stringify([
                        ...messages,
                        { role: "user", content: userInput },
                        { role: "ai", content: aiResponse }
                    ])
                );
            }
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setMessages(prev => [
                ...prev,
                { role: "ai", content: "An error occurred." }
            ]);
        }

        setUserInput("");
    };

    const handleCopy = text => {
        navigator.clipboard.writeText(text).then(() => {
            alert("Code copied to clipboard!");
        });
    };

    return (
        <div>
            <h1>AI Chat with Dani</h1>

            {/* Check if user is logged in */}
            {!session ? (
                <button onClick={() => signIn("google")}>
                    .
                </button>
            ) : (
                <div>
                    <p>Welcome, {session.user.name}</p>
                    <button onClick={() => signOut()}>Sign Out</button>
                </div>
            )}

            <div className="chat-container" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                        <strong>{msg.role === "user" ? "You" : "Dani"}:</strong>{" "}
                        {msg.role === "ai" && /```/.test(msg.content) ? (
                            // Detect code blocks in AI response
                            <div>
                                <pre>{msg.content}</pre>
                                <button onClick={() => handleCopy(msg.content)}>
                                    Copy Code
                                </button>
                            </div>
                        ) : (
                            msg.content
                        )}
                    </div>
                ))}
            </div>

            <div className="input-container">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage}>
                    <span className="material-symbols-outlined">send</span>
                </button>
            </div>
        </div>
    );
}
