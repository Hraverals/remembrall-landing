// kit 공개 API. 발표 자료는 이 파일과 scenarios/index.ts 만 import 한다.
// kit/ · scenarios/ 는 react · react-dom · gsap 외의 패키지를 쓰지 않는다(사진 · 폰트 · 아이콘은 이 폴더 기준 상대 경로).
export {
    easeInOutCubic,
    easeInOutQuad,
    lastBeatEnd,
    progress,
} from "./engine/clock";
export type {
    Aside,
    AsideProps,
    Beat,
    CameraPose,
    Drag,
    Motion,
    Scenario,
    Segment,
    Tap,
} from "./engine/types";
export { defineScenario } from "./engine/types";
export { ScenarioPhone } from "./phone/ScenarioPhone";
export type { ScenarioPlayerProps } from "./props";
export { ScenarioStage, type ScenarioStageProps } from "./stage/ScenarioStage";
