import React, { useEffect, useState, useRef } from "react";
import { getMatchMessages, sendMessage } from "../api/messages";
import { fetchMatches } from "../api/match";
import { getCurrentUser } from "../api/users";
import { useSocket } from "../contexts/SocketContext";
import { useUser } from "@clerk/clerk-react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, TagIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function MessagesPage() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const socket = useSocket();
  const { user } = useUser();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentUser();
    loadMatches();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user._id);
    } catch (err) {
      console.error("Error loading current user:", err);
    }
  };

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

  const loadMatches = async () => {
    setLoadingMatches(true);
    try {
      const data = await fetchMatches({ myMatches: "true" });
      const matchesList = Array.isArray(data) ? data : (data.matches || []);
      setMatches(matchesList);
      // Auto-select first match if available and none selected
      if (matchesList.length > 0 && !selectedMatch) {
        setSelectedMatch(matchesList[0]._id);
      }
    } catch (err) {
      console.error("Failed to load matches:", err);
    } finally {
      setLoadingMatches(false);
    }
  };

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

      <div className="grid md:grid-cols-3 gap-4">
        {/* Matches List */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
              Your Matches
            </h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
            {loadingMatches ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <p className="text-sm">No matches yet</p>
                <button
                  onClick={() => navigate("/matches")}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  View Matches
                </button>
              </div>
            ) : (
              matches.map((match) => {
                const matchInfo = match.listing || match.demand;
                const otherUser = match.listing?.farmerId || match.demand?.buyerId;
                const matchTitle = match.listing 
                  ? `${match.listing.crop} - ${match.listing.quantityKg}kg`
                  : `${match.demand?.crop} - ${match.demand?.qtyKg}kg`;
                
                return (
                  <button
                    key={match._id}
                    onClick={() => setSelectedMatch(match._id)}
                    className={`w-full p-4 text-left border-b border-slate-100 hover:bg-blue-50 transition-colors ${
                      selectedMatch === match._id ? "bg-blue-100 border-blue-300" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <TagIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        selectedMatch === match._id ? "text-blue-600" : "text-slate-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                            Match
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            match.status === "accepted" ? "bg-green-100 text-green-700" :
                            match.status === "completed" ? "bg-slate-100 text-slate-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {match.status}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 truncate">{matchTitle}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {otherUser?.name || "User"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        {!selectedMatch ? (
          <div className="md:col-span-2 bg-white p-8 rounded-xl shadow-md text-center flex items-center justify-center">
            <div>
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Select a match to view messages</p>
              <p className="text-sm text-slate-400 mt-2">Choose a match from the list to start chatting</p>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2">
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
                // Compare using local user ID
                const msgFromId = typeof msg.from === 'object' ? msg.from?._id?.toString() : msg.from?.toString();
                const isCurrentUser = currentUserId && msgFromId === currentUserId?.toString();
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
          </div>
        )}
      </div>
    </div>
  );
}

