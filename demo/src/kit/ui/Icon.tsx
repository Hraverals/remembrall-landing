// 아이콘. 앱 C/Icon/* 과 같은 lucide 아이콘(선 1.75)이고, play 만 앱 전용 경로(채운 삼각형)다.
// 앱에 없는 것(Shorts 화면 · 공유 시트 · 알림창)도 일반 lucide 아이콘만 쓴다. 다른 앱 · 서비스의 로고는 그리지 않는다.
// kit 은 react 외 의존성을 쓰지 않으므로 lucide-react 대신 lucide v1.70.0 의 SVG 요소를 그대로 옮겨 적는다(landing 과 같은 그림).
//
// Lucide — ISC License. Copyright (c) 2026 Lucide Icons and Contributors.
// Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted,
// provided that the above copyright notice and this permission notice appear in all copies.
import { createElement } from "react";

type IconNode = readonly (readonly [
    string,
    Readonly<Record<string, string>>,
])[];

const LUCIDE = {
    arrowLeft: [
        ["path", { d: "m12 19-7-7 7-7" }],
        ["path", { d: "M19 12H5" }],
    ],
    chevronRight: [["path", { d: "m9 18 6-6-6-6" }]],
    // 앱 C/Icon close(lucide x) · check
    close: [
        ["path", { d: "M18 6 6 18" }],
        ["path", { d: "m6 6 12 12" }],
    ],
    check: [["path", { d: "M20 6 9 17l-5-5" }]],
    footprints: [
        [
            "path",
            {
                d: "M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z",
            },
        ],
        [
            "path",
            {
                d: "M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z",
            },
        ],
        ["path", { d: "M16 17h4" }],
        ["path", { d: "M4 13h4" }],
    ],
    map: [
        [
            "path",
            {
                d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
            },
        ],
        ["path", { d: "M15 5.764v15" }],
        ["path", { d: "M9 3.236v15" }],
    ],
    images: [
        ["path", { d: "m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16" }],
        ["path", { d: "M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2" }],
        ["circle", { cx: "13", cy: "7", r: "1", fill: "currentColor" }],
        ["rect", { x: "8", y: "2", width: "14", height: "14", rx: "2" }],
    ],
    settings: [
        [
            "path",
            {
                d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
            },
        ],
        ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
    locateFixed: [
        ["line", { x1: "2", x2: "5", y1: "12", y2: "12" }],
        ["line", { x1: "19", x2: "22", y1: "12", y2: "12" }],
        ["line", { x1: "12", x2: "12", y1: "2", y2: "5" }],
        ["line", { x1: "12", x2: "12", y1: "19", y2: "22" }],
        ["circle", { cx: "12", cy: "12", r: "7" }],
        ["circle", { cx: "12", cy: "12", r: "3" }],
    ],
    heart: [
        [
            "path",
            {
                d: "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5",
            },
        ],
    ],
    messageCircle: [
        [
            "path",
            {
                d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
            },
        ],
    ],
    share: [
        ["circle", { cx: "18", cy: "5", r: "3" }],
        ["circle", { cx: "6", cy: "12", r: "3" }],
        ["circle", { cx: "18", cy: "19", r: "3" }],
        ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49" }],
        ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49" }],
    ],
    copy: [
        [
            "rect",
            { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" },
        ],
        [
            "path",
            { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" },
        ],
    ],
    messageSquare: [
        [
            "path",
            {
                d: "M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z",
            },
        ],
    ],
    notebookPen: [
        [
            "path",
            {
                d: "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4",
            },
        ],
        ["path", { d: "M2 6h4" }],
        ["path", { d: "M2 10h4" }],
        ["path", { d: "M2 14h4" }],
        ["path", { d: "M2 18h4" }],
        [
            "path",
            {
                d: "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z",
            },
        ],
    ],
    mail: [
        ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }],
        ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" }],
    ],
    bluetooth: [["path", { d: "m7 7 10 10-5 5V2l5 5L7 17" }]],
    printer: [
        [
            "path",
            {
                d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
            },
        ],
        ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" }],
        ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1" }],
    ],
    ellipsis: [
        ["circle", { cx: "12", cy: "12", r: "1" }],
        ["circle", { cx: "19", cy: "12", r: "1" }],
        ["circle", { cx: "5", cy: "12", r: "1" }],
    ],
    wifi: [
        ["path", { d: "M12 20h.01" }],
        ["path", { d: "M2 8.82a15 15 0 0 1 20 0" }],
        ["path", { d: "M5 12.859a10 10 0 0 1 14 0" }],
        ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0" }],
    ],
    flashlight: [
        ["path", { d: "M12 13v1" }],
        [
            "path",
            {
                d: "M17 2a1 1 0 0 1 1 1v4a3 3 0 0 1-.6 1.8l-.6.8A4 4 0 0 0 16 12v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8a4 4 0 0 0-.8-2.4l-.6-.8A3 3 0 0 1 6 7V3a1 1 0 0 1 1-1z",
            },
        ],
        ["path", { d: "M6 6h12" }],
    ],
    moon: [
        [
            "path",
            {
                d: "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
            },
        ],
    ],
} as const satisfies Record<string, IconNode>;

export type IconName = keyof typeof LUCIDE | "play";

const STROKE_WIDTH = 1.75;

type Props = {
    name: IconName;
    size: number;
    color?: string;
};

export function Icon({ name, size, color = "var(--icon-default)" }: Props) {
    if (name === "play") {
        return (
            <svg width={size} height={size} viewBox="0 0 24 24">
                <path d="M8 5.5V18.5L18.5 12L8 5.5Z" fill={color} />
            </svg>
        );
    }
    const node: IconNode = LUCIDE[name];
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color }}
        >
            {node.map(([tag, attrs], index) =>
                createElement(tag, { key: index, ...attrs }),
            )}
        </svg>
    );
}
