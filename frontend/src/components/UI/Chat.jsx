import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { Icon } from "./helpers";

export default function Chat({ requestId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get(`/chat/${requestId}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      await api.post(`/chat/${requestId}`, { message: newMsg });
      setNewMsg("");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Icon name="comment" className="text-blue-600" />
        <h3 className="font-bold text-gray-900 text-sm">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">Inicia la conversación</p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderEmail === user.email;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-900 rounded-bl-md"
              }`}>
                {!isMine && <p className="text-[0.65rem] font-bold opacity-70 mb-0.5">{msg.senderName}</p>}
                <p className="text-sm">{msg.message}</p>
                <p className={`text-[0.6rem] mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newMsg.trim() || sending}
          className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          <Icon name="paper-plane" />
        </button>
      </form>
    </div>
  );
}
