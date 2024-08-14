import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="295890781442-h04i4h53cffst1hi6tdfvodlm6p3hd19.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
