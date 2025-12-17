import React, { useState, useRef, useEffect } from "react";
import { MapPinIcon, CurrencyDollarIcon, ScaleIcon, SparklesIcon, ChevronUpIcon, UserIcon, PhotoIcon, ClockIcon, TruckIcon, EyeIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeIconSolid } from "@heroicons/react/24/solid";
import { incrementDemandViews } from "../api/demand";
import { fetchMatches, createMatch } from "../api/match";
import { getMatchMessages, sendMessage } from "../api/messages";
import { useSocket } from "../contexts/SocketContext";
import { useUser } from "@clerk/clerk-react";
import { getCurrentUser } from "../api/users";

// Utility function to format time since posted
const getTimeSince = (dateString) => {
  if (!dateString) return "Recently";
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now - posted;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);
  const diffMonths = Math.floor(diffMs / 2592000000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
};

export default function DemandCard({ item, onOfferSupply, showActions = true, isExpanded: isExpandedProp, onExpand }) {
  if (!item) return null;

  const cardRef = useRef(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [matchId, setMatchId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const socket = useSocket();
  const { user: clerkUser } = useUser();
  const messagesEndRef = useRef(null);
  
  // Use controlled or uncontrolled state
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  
  const handleExpand = (expanded) => {
    if (onExpand) {
      onExpand(expanded ? item._id : null);
    } else {
      setInternalExpanded(expanded);
    }
  };

  // Scroll card into view when expanded
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      // Use setTimeout to ensure DOM has updated with expanded content
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 100);
    }
  }, [isExpanded]);

  const handleCardClick = async (e) => {
    // Don't expand if clicking buttons or links
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    const wasExpanded = isExpanded;
    handleExpand(!isExpanded);
    
    // Increment views when expanding (not when collapsing)
    if (!wasExpanded && item._id) {
      await incrementDemandViews(item._id);
    }
  };

  const handleOfferSupply = (e) => {
    e.stopPropagation();
    if (onOfferSupply) onOfferSupply(item);
  };

  // Load current user ID
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUserId(user._id);
      } catch (err) {
        console.error("Error loading current user:", err);
      }
    };
    loadUser();
  }, []);

  // Load or create match for messaging
  useEffect(() => {
    if (showMessaging && isExpanded && item._id) {
      loadOrCreateMatch();
    }
  }, [showMessaging, isExpanded, item._id]);

  // Load messages when match is found
  useEffect(() => {
    if (matchId) {
      loadMessages();
      // Set up socket listener
      if (socket) {
        socket.emit("joinMatch", matchId);
        const handleNewMessage = (message) => {
          if (message.matchId === matchId || message.matchId?._id === matchId) {
            setMessages(prev => [...prev, message]);
          }
        };
        socket.on("newMessage", handleNewMessage);
        return () => {
          socket.emit("leaveMatch", matchId);
          socket.off("newMessage", handleNewMessage);
        };
      }
    }
  }, [matchId, socket]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadOrCreateMatch = async () => {
    try {
      const currentUser = await getCurrentUser();
      // Check if user is the buyer (can't message themselves)
      if (currentUser._id === (item.buyerId?._id || item.buyerId)) {
        return;
      }

      // Try to find existing match
      const matches = await fetchMatches({ myMatches: "true" });
      const matchesList = Array.isArray(matches) ? matches : (matches.matches || []);
      const existingMatch = matchesList.find(m => 
        m.demand?._id === item._id || m.demandId === item._id
      );

      if (existingMatch) {
        setMatchId(existingMatch._id);
      } else {
        // No existing match - user needs to create one via Offer Supply or Matches page
        setMatchId(null);
      }
    } catch (err) {
      console.error("Error loading match:", err);
    }
  };

  const loadMessages = async () => {
    if (!matchId) return;
    setLoadingMessages(true);
    try {
      const data = await getMatchMessages(matchId);
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newMessage.trim() || !matchId || sendingMessage) return;

    setSendingMessage(true);
    try {
      const message = await sendMessage(matchId, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const urgencyColors = {
    urgent: "bg-red-500 text-white",
    high: "bg-orange-500 text-white",
    medium: "bg-yellow-500 text-white",
    low: "bg-blue-500 text-white"
  };

  const buyer = item.buyerId || item.buyer;
  const profilePic = buyer?.profilePicture;
  const buyerName = buyer?.name || "Unknown Buyer";
  const isBuyerVerified = buyer?.isVerified || false;
  const primaryImage = item.images && item.images.length > 0 ? item.images[0] : null;

  return (
    <div 
      ref={cardRef}
      onClick={handleCardClick}
      className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-emerald-300 group cursor-pointer overflow-hidden ${isExpanded ? 'md:col-span-full' : ''}`}
    >
      {/* Hero Image Section */}
      {primaryImage ? (
        <div className="relative h-32 md:h-36 w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100">
          <img 
            src={primaryImage} 
            alt={item.crop}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full">
            <div className={`text-[10px] md:text-xs font-bold ${item.status === 'open' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'OPEN'}
            </div>
          </div>
          {item.urgency && (
            <div className={`absolute top-2 left-2 md:top-3 md:left-3 ${urgencyColors[item.urgency] || urgencyColors.medium} backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold`}>
              {item.urgency.toUpperCase()} NEED
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-32 md:h-36 w-full bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100 flex items-center justify-center">
          <PhotoIcon className="w-12 h-12 md:w-16 md:h-16 text-emerald-300" />
          <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full">
            <div className={`text-[10px] md:text-xs font-bold ${item.status === 'open' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {item.status?.toUpperCase() || 'OPEN'}
            </div>
          </div>
          {item.urgency && (
            <div className={`absolute top-2 left-2 md:top-3 md:left-3 ${urgencyColors[item.urgency] || urgencyColors.medium} backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold`}>
              {item.urgency.toUpperCase()} NEED
            </div>
          )}
        </div>
      )}

      {/* Basic Card View */}
      <div className="p-3 md:p-4">
        <div className="mb-2 md:mb-3">
          <h3 className="text-base md:text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-1 md:mb-1.5 line-clamp-1">
            {item.crop}
          </h3>
          <div className="flex items-center gap-2 md:gap-2.5 text-xs md:text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <ScaleIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">{item.qtyKg} kg</span>
            </div>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800 text-xs">
                {item.priceOffer ? (
                  <>
                    <span>KES {item.priceOffer.toLocaleString()}/kg</span>
                    <span className="text-slate-500 ml-1">({(item.priceOffer * item.qtyKg).toLocaleString()} total)</span>
                  </>
                ) : "Negotiable"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Buyer Info */}
        <div className="flex items-center gap-2 md:gap-2.5 mb-2 md:mb-3 pb-2 md:pb-3 border-b border-slate-100">
          {profilePic ? (
            <img 
              src={profilePic} 
              alt={buyerName}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2 border-emerald-200 ring-1 ring-emerald-50"
            />
          ) : (
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center ring-1 ring-emerald-50">
              <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-xs md:text-sm text-slate-800 truncate">{buyerName}</span>
              {isBuyerVerified ? (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-0.5 flex-shrink-0">
                  <CheckBadgeIconSolid className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  <span className="hidden sm:inline">Verified</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-bold flex-shrink-0">
                  <span className="hidden sm:inline">Not Verified</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-600">
              {buyer?.rating && (
                <span>⭐ {buyer.rating.toFixed(1)}</span>
              )}
              {buyer?.rating && <span className="text-slate-400">•</span>}
              <div className="flex items-center gap-0.5 truncate">
                <MapPinIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{item.location?.county || "Location"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand Indicator & Impressions */}
        <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <EyeIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
              <span className="font-semibold text-slate-600">{item.views || 0} views</span>
            </div>
            {(item.createdAt || item.created_at) && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded-full">
                <ClockIcon className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-500" />
                <span className="font-semibold text-slate-600">{getTimeSince(item.createdAt || item.created_at)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center font-medium">
            <span className="hidden sm:inline">Click to {isExpanded ? 'collapse' : 'view details'}</span>
            <span className="sm:hidden">{isExpanded ? 'Less' : 'More'}</span>
            <ChevronUpIcon className={`w-3 h-3 md:w-3.5 md:h-3.5 ml-0.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="border-t-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 md:p-4 space-y-3 md:space-y-4 animate-in slide-in-from-top-2">
          {/* Reference Images Gallery */}
          {item.images && item.images.length > 0 && (
            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-sm md:text-base text-slate-800 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <PhotoIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                <span>Reference Images</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
                {item.images.map((img, idx) => (
                  <div key={idx} className="relative group/image overflow-hidden rounded-lg">
                    <img 
                      src={img} 
                      alt={`${item.crop} reference ${idx + 1}`}
                      className="w-full h-24 md:h-32 object-cover group-hover/image:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Details & Buyer Info - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Product Requirements */}
            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-sm md:text-base text-slate-800 mb-2 md:mb-3">Product Requirements</h4>
              <div className="grid grid-cols-2 gap-2 md:gap-2.5">
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Crop Needed</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800 truncate">{item.crop}</div>
                </div>
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Category</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800 capitalize truncate">{item.category || "N/A"}</div>
                </div>
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Quantity</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800">{item.qtyKg} kg</div>
                </div>
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Price Offer</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800 truncate">
                    {item.priceOffer ? `KES ${item.priceOffer.toLocaleString()}` : "Negotiable"}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg col-span-2">
                  <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Negotiable</div>
                  <div className="font-bold text-xs md:text-sm text-slate-800">
                    {item.isPriceNegotiable ? "Yes" : "No"}
                  </div>
                </div>
                {item.preferredPickupRadiusKm && (
                  <div className="bg-slate-50 p-2 md:p-2.5 rounded-lg col-span-2">
                    <div className="text-[10px] md:text-xs text-slate-500 mb-0.5 md:mb-1">Pickup Radius</div>
                    <div className="font-bold text-xs md:text-sm text-slate-800">{item.preferredPickupRadiusKm} km</div>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Details */}
            <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
              <h4 className="font-bold text-sm md:text-base text-slate-800 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                <span>Buyer Info</span>
              </h4>
              <div className="flex items-start gap-2 md:gap-3">
                {profilePic ? (
                  <img 
                    src={profilePic} 
                    alt={buyerName}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-emerald-200 ring-1 ring-emerald-50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center ring-1 ring-emerald-50 flex-shrink-0">
                    <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-bold text-xs md:text-sm text-slate-800 truncate">{buyerName}</span>
                    {isBuyerVerified ? (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-0.5 flex-shrink-0">
                        <CheckBadgeIconSolid className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span className="hidden sm:inline">Verified</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] md:text-xs font-bold flex-shrink-0">
                        <span className="hidden sm:inline">Not Verified</span>
                      </span>
                    )}
                  </div>
                  {buyer?.rating && (
                    <div className="text-[10px] md:text-xs text-slate-600 mb-0.5">⭐ {buyer.rating.toFixed(1)} rating</div>
                  )}
                  {buyer?.phone && (
                    <div className="text-[10px] md:text-xs text-slate-600 truncate">📞 {buyer.phone}</div>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs text-slate-600">
                    <MapPinIcon className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{item.location?.county || "N/A"}</span>
                    {item.location?.town && <span className="text-slate-400">• {item.location.town}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {showActions && item.status === 'open' && onOfferSupply && (
              <button 
                onClick={handleOfferSupply}
                className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-emerald-700 hover:via-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
                Offer Supply
              </button>
            )}
            
            {/* Message User Button */}
            {showActions && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMessaging(!showMessaging);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold text-sm md:text-base shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                {showMessaging ? "Hide Messages" : "Message User"}
              </button>
            )}
          </div>

          {/* Messaging Interface */}
          {showMessaging && (
            <div className="mt-4 bg-white rounded-lg border-2 border-blue-200 shadow-lg overflow-hidden">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />
                  Messages
                </h4>
              </div>
              {!matchId ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  <p>Create a match first to start messaging.</p>
                  <p className="text-xs mt-1">Use "Offer Supply" to create a match, then you can message here.</p>
                </div>
              ) : (
                <>
                  <div className="h-48 overflow-y-auto p-3 space-y-2">
                    {loadingMessages ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-slate-500 text-sm py-4">
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
                              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
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
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-blue-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
          
          {/* Collapse Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleExpand(false);
            }}
            className="w-full px-3 md:px-4 py-2 md:py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg md:rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-1.5 md:gap-2"
          >
            <ChevronUpIcon className="w-4 h-4 md:w-5 md:h-5" />
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}
