import { WindowContextProvider, menuItems } from "@/lib/window";
import appIcon from "@/resources/build/icon.png";
import React from "react";
import reactDom from "react-dom/client";
import App from "./app";
import "./styles/app.css";

reactDom.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <WindowContextProvider
      titlebar={{ title: "Electron React App", icon: appIcon, menuItems }}
    >
      <App />
    </WindowContextProvider>
  </React.StrictMode>,
);
