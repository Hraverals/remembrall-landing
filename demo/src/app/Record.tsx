// 녹화 화면(?record=ID). 1920×1080 무대만 컨트롤 · 커서 없이 loop 재생한다. 시연 영상 편집에 화면 녹화로 쓴다.
// 무대는 창 크기에 맞춘다(contain). 창이 1920×1080 이면(OBS 브라우저 소스 1920×1080, 1920×1080 화면에서 F11) 정확히 1920×1080 이다.
// 남는 곳은 무대와 같은 바탕이다. bg=transparent 면 무대 바탕 없이 페이지를 크로마키 초록으로 칠한다.
// 반복 사이 쉼은 두지 않는다(엔진의 끝 크로스페이드가 이어 준다). 한 바퀴 길이는 README 시나리오 표에 있다.
import { ScenarioStage } from "../kit";
import type { Recording } from "./params";

export function RecordScreen({ recording }: { recording: Recording }) {
    return (
        <div
            className={`app-record app-record--${recording.background}`}
            data-app-record={recording.scenario.id}
        >
            <ScenarioStage
                scenario={recording.scenario}
                mode="loop"
                speed={recording.speed}
                background={recording.background}
            />
        </div>
    );
}
