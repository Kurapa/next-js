"use client";

import { useState, useRef, useEffect } from "react";
import { Tractor, Leaf, Sparkles, Bot, User, Send } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChatHeader } from "@/components/chat/chatheader";
import DashboardLayout from "@/components/layout/DashboardLayout";

const MessageBubble = ({ sender, text }: { sender: string; text: string }) => (
  <div className={`flex items-end mb-3 ${sender === "user" ? "justify-end" : "justify-start"}`}>
    {sender === "bot" && (
      <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mr-2 text-green-900 shadow-md fade-in">
        <Bot size={22} />
      </div>
    )}
    <div className={`max-w-xs px-4 py-3 rounded-xl shadow-md text-sm break-words fade-in border
      ${sender === "user"
        ? "bg-green-200 text-green-900 border-green-300 rounded-br-none"
        : "bg-green-50 text-green-800 border-green-200 rounded-bl-none"
      }`}
    >
      {text}
    </div>
    {sender === "user" && (
      <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center ml-2 text-white shadow-md fade-in">
        <User size={22} />
      </div>
    )}
  </div>
);

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setMessages([
        {
          sender: "bot",
          text: `Hello, ${user.displayName || "Farmer"}! 🚜 Ask any agriculture question.`,
        },
      ]);
    } else {
      setMessages([
        { sender: "bot", text: "Hello! Please sign in for personal farming advice." },
      ]);
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending user's question and displaying Gemini's reply
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const question = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: question }, { sender: "bot", text: "Thinking..." }]);
    setInput("");

    // Get the latest user profile and crops from Firestore
    let userProfile = {};
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) userProfile = snapshot.data();
    }

    try {
      const res = await fetch("/api/chatbotGemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, userProfile }),
      });
      const { text } = await res.json();
      setMessages((prev) =>
        prev.map((m, i) => (i === prev.length - 1 ? { ...m, text } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, text: "Sorry, I could not answer. Please try again." }
            : m
        )
      );
    }
  };

  return (
   <DashboardLayout>
     <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-50 flex flex-col">
      <ChatHeader />
      <main className="flex-grow flex items-center justify-center">
        <section className="w-full max-w-xl bg-white rounded-3xl shadow-xl py-7 px-5 flex flex-col h-[65vh]">
          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {messages.map((msg, i) => (
              <MessageBubble key={i} sender={msg.sender} text={msg.text} />
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
            <textarea
              className="flex-1 resize-none border-2 border-green-400 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-600 text-green-900 bg-green-50 placeholder-green-600 transition"
              rows={2}
              maxLength={240}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, weather, fertilizer..."
              autoFocus
              aria-label="Type your message"
              disabled={!user}
            />
            <button
              type="submit"
              disabled={!input.trim() || !user}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow font-medium transition disabled:opacity-40 disabled:cursor-not-allowed fade-in flex items-center gap-1"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </section>
      </main>
    </div>
   </DashboardLayout>
  );
}
