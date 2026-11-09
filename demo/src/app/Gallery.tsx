// 갤러리. 왼쪽 시나리오 목록, 위 조작 줄, 가운데 무대(또는 폰만).
// - step: → ← 키(또는 버튼)로 비트를 옮긴다. -1 은 시작 전. 비트가 끝까지 재생되면 "비트 n 끝"을 보인다.
// - loop: 전체 반복.
// - 상자: 넓게(가운데 영역을 채움) · 좁고 낮게(420×200) — height 없이 부모 상자에 contain 되는지 본다.
// - 바탕: 무대 bg/screen 또는 투명(뒤에 줄무늬 슬라이드 바탕을 깔아 비치는지 본다).
import { useEffect, useState } from "react";

import { ScenarioPhone, ScenarioStage } from "../kit";
import { SCENARIOS } from "../scenarios";

const SPEEDS = [0.5, 1, 1.5, 2] as const;

type Props = { initialId: string | null };

export function Gallery({ initialId }: Props) {
    const [id, setId] = useState(initialId ?? SCENARIOS[0]?.id ?? "");
    const [mode, setMode] = useState<"step" | "loop">("step");
    const [beat, setBeat] = useState(0);
    const [ended, setEnded] = useState<number | null>(null);
    const [speed, setSpeed] = useState<number>(1);
    const [view, setView] = useState<"stage" | "phone">("stage");
    const [background, setBackground] = useState<"screen" | "transparent">(
        "screen",
    );
    const [box, setBox] = useState<"wide" | "small">("wide");

    const scenario = SCENARIOS.find((item) => item.id === id) ?? SCENARIOS[0];
    const count = scenario?.beats.length ?? 0;

    const moveBeat = (delta: number) => {
        setEnded(null);
        setBeat((value) => Math.max(-1, Math.min(count - 1, value + delta)));
    };

    useEffect(() => {
        if (mode !== "step") return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") moveBeat(1);
            else if (event.key === "ArrowLeft") moveBeat(-1);
            else return;
            event.preventDefault();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    if (scenario == null) return <p>시나리오가 없어요</p>;

    const current = scenario.beats[beat];
    const props = {
        scenario,
        mode,
        beat,
        speed,
        onBeatEnd: (index: number) => setEnded(index),
    };

    return (
        <div className="app-gallery">
            <nav className="app-list" aria-label="시나리오">
                {SCENARIOS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className="app-list__item"
                        aria-current={item.id === scenario.id}
                        onClick={() => {
                            setId(item.id);
                            setBeat(0);
                            setEnded(null);
                        }}
                    >
                        <span className="app-list__id">{item.id}</span>
                        {item.title}
                        {item.concept === true && " · 컨셉"}
                    </button>
                ))}
            </nav>

            <main className="app-main">
                <div className="app-toolbar">
                    <Toggle
                        label="방식"
                        value={mode}
                        options={[
                            ["step", "step"],
                            ["loop", "loop"],
                        ]}
                        onChange={(value) => {
                            setMode(value);
                            setEnded(null);
                        }}
                    />
                    {mode === "step" && (
                        <div className="app-group">
                            <button type="button" onClick={() => moveBeat(-1)}>
                                ←
                            </button>
                            <span className="app-beat" data-app-beat={beat}>
                                {beat < 0
                                    ? `시작 전 / ${count}`
                                    : `${beat + 1} / ${count} · ${current?.label ?? ""}`}
                            </span>
                            <button type="button" onClick={() => moveBeat(1)}>
                                →
                            </button>
                        </div>
                    )}
                    <span className="app-ended" data-app-ended={ended ?? ""}>
                        {ended == null ? "" : `비트 ${ended + 1} 끝`}
                    </span>
                    <Toggle
                        label="속도"
                        value={String(speed)}
                        options={SPEEDS.map((item) => [
                            String(item),
                            `${item}×`,
                        ])}
                        onChange={(value) => setSpeed(Number(value))}
                    />
                    <Toggle
                        label="보기"
                        value={view}
                        options={[
                            ["stage", "무대"],
                            ["phone", "폰만"],
                        ]}
                        onChange={setView}
                    />
                    <Toggle
                        label="바탕"
                        value={background}
                        options={[
                            ["screen", "무대"],
                            ["transparent", "투명"],
                        ]}
                        onChange={setBackground}
                    />
                    <Toggle
                        label="상자"
                        value={box}
                        options={[
                            ["wide", "넓게"],
                            ["small", "좁고 낮게"],
                        ]}
                        onChange={setBox}
                    />
                </div>

                <div className="app-area">
                    <div
                        className={`app-box app-box--${box}${background === "transparent" ? " app-box--slide" : ""}`}
                    >
                        {view === "stage" ? (
                            <ScenarioStage {...props} background={background} />
                        ) : (
                            <ScenarioPhone {...props} />
                        )}
                    </div>
                </div>
                {mode === "step" && current != null && (
                    <p className="app-caption">자막: {current.caption}</p>
                )}
            </main>
        </div>
    );
}

type ToggleProps<T extends string> = {
    label: string;
    value: T;
    options: readonly (readonly [T, string])[];
    onChange: (value: T) => void;
};

function Toggle<T extends string>({
    label,
    value,
    options,
    onChange,
}: ToggleProps<T>) {
    return (
        <div className="app-group" role="group" aria-label={label}>
            <span className="app-group__label">{label}</span>
            {options.map(([key, text]) => (
                <button
                    key={key}
                    type="button"
                    aria-pressed={key === value}
                    onClick={() => onChange(key)}
                >
                    {text}
                </button>
            ))}
        </div>
    );
}
