import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  useEffect(() => {
    const s = io(url, { transports: ["websocket", "polling"] });
    setSocket(s);
    console.log("[socket] connecting to", url);

    s.on("connect", () => console.log("[socket] connected", s.id));
    s.on("disconnect", () => console.log("[socket] disconnected"));

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [url]);

  const value = useMemo(() => socket, [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
