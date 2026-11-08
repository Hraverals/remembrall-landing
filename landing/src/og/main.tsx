// OG 카드 페이지 진입점(og.html). 본 페이지와 같은 폰트 · 토큰 · 폰 스타일을 쓴다. 배포 빌드에는 들어가지 않는다.
import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/500.css";
import "@fontsource/gowun-dodum/400.css";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/hero.css";
import "./og.css";

import { createRoot } from "react-dom/client";

import { OgCard } from "./OgCard";

const root = document.getElementById("og");
if (root == null) throw new Error("#og 가 없다");

createRoot(root).render(<OgCard />);
