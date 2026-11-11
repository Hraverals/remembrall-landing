// 임베드 플레이어 진입(embed.html). 갤러리 스타일(app.css)은 부르지 않는다.
import "./embed.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { EmbedScreen } from "./Embed";

const root = document.getElementById("root");
if (root == null) throw new Error("#root 가 없다");

createRoot(root).render(
    <StrictMode>
        <EmbedScreen />
    </StrictMode>,
);
