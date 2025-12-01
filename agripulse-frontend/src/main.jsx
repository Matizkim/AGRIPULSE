import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/tailwind.css";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { setTokenGetter } from "./utils/getClerkToken";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Component to set up token getter
function TokenSetup() {
  const { getToken } = useAuth();
  React.useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <TokenSetup />
      <SocketProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </SocketProvider>
    </ClerkProvider>
  </React.StrictMode>
);
