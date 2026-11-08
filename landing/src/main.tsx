import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/500.css";
import "@fontsource/gowun-dodum/400.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/hero.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";

const root = document.getElementById("root");
if (root == null) throw new Error("#root 가 없다");

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
