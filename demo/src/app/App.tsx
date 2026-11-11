// 앱 진입. ?show 면 발표 화면, ?record= 면 녹화 화면, 정지 시각(?t= · ?beat=)이 있으면 1920×1080 정지 화면만, 아니면 갤러리.
import { ScenarioPhone, ScenarioStage } from "../kit";
import { Gallery } from "./Gallery";
import { readParams } from "./params";
import { RecordScreen } from "./Record";
import { ShowScreen } from "./Show";

export function App() {
    const { scenarioId, frozen, recording, show } = readParams(location.search);
    if (show != null) return <ShowScreen scenarios={show} />;
    if (recording != null) return <RecordScreen recording={recording} />;
    if (frozen != null) {
        return (
            <div className="app-frozen" data-app-frozen>
                {frozen.view === "phone" ? (
                    <ScenarioPhone
                        scenario={frozen.scenario}
                        mode="step"
                        at={frozen.at}
                        height={1080}
                    />
                ) : (
                    <ScenarioStage
                        scenario={frozen.scenario}
                        mode="step"
                        at={frozen.at}
                        height={1080}
                        background={frozen.background}
                    />
                )}
            </div>
        );
    }
    return <Gallery initialId={scenarioId} />;
}
