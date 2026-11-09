import "./app/app.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app/App";

const root = document.getElementById("root");
if (root == null) throw new Error("#root 가 없다");

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
