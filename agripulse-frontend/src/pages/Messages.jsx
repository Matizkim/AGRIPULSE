import React, { useEffect, useState, useRef } from "react";
import { getMatchMessages, sendMessage } from "../api/messages";
import { useSocket } from "../contexts/SocketContext";
import { useUser } from "@clerk/clerk-react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function MessagesPage() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedMatch) {
      loadMessages();
    }
  }, [selectedMatch]);

  useEffect(() => {
    if (socket && selectedMatch) {
      // Join match room
      socket.emit("joinMatch", selectedMatch);

      // Listen for new messages
      const handleNewMessage = (message) => {
        if (message.matchId === selectedMatch || message.matchId?._id === selectedMatch) {
          setMessages(prev => [...prev, message]);
        }
      };
      
      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.emit("leaveMatch", selectedMatch);
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [socket, selectedMatch]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedMatch) return;
    setLoading(true);
    try {
      const data = await getMatchMessages(selectedMatch);
      setMessages(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      const message = await sendMessage(selectedMatch, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Messages</h2>
      </div>

      {!selectedMatch ? (
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <ChatBubbleLeftRightIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Select a match to view messages</p>
          <p className="text-sm text-slate-400 mt-2">Go to Matches page and click on a match to start chatting</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col" style={{ height: "600px" }}>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.from?._id?.toString() === user?.id || 
                                     msg.from?.clerkId === user?.id ||
                                     (typeof msg.from === 'string' && msg.from === user?.id);
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">{msg.from?.name || "User"}</div>
                      <div>{msg.content}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border-2 border-slate-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

