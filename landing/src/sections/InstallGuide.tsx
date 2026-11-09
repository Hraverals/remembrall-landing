// 설치하는 방법(#install). 히어로의 "설치 안내" 링크가 여기로 내려온다.
// 이렇게 써요와 같은 2열 · 번호 목록이고, 목록은 한 단계 작게(compact) 둔다. 목록 아래 삼성 폰 배터리 참고 한 줄.
// 휴대폰 설정 화면에 보이는 앱 이름은 app.json 의 name 인 "Remembrall" 이라 참고 줄도 그 이름을 쓴다.
import { type Step, StepList } from "./StepList";

const STEPS: readonly Step[] = [
    {
        number: "01",
        title: "APK 받기",
        body: "위의 “APK 다운로드”를 눌러 파일을 받아요.",
    },
    {
        number: "02",
        title: "설치 허용",
        body: "설치할 때 '출처를 알 수 없는 앱 설치'를 묻는 창이 뜨면, 파일을 받은 앱(Chrome 등)에서 '이 출처 허용'을 켜 주세요. Play 프로텍트 경고가 뜨면 내용을 확인한 뒤 설치를 계속해 주세요.",
    },
    {
        number: "03",
        title: "권한 허용",
        body: "처음 열면 위치 정보 이용 동의와 위치 · 알림 권한을 물어봐요. 위치는 '항상 허용'으로 해야 앱이 꺼져 있을 때도 저장한 곳 근처에서 알려드릴 수 있어요.",
    },
];

export function InstallGuide() {
    return (
        <section
            id="install"
            className="section section--split"
            aria-labelledby="install-title"
        >
            <h2 id="install-title" className="section__title">
                설치하는 방법
            </h2>
            <div>
                <StepList steps={STEPS} compact />
                <p className="section__note">
                    삼성 폰은 설정 → 애플리케이션 → Remembrall → 배터리에서
                    '제한 없음'으로 두면, 앱이 꺼져 있을 때 도착을 놓치는 일을
                    줄일 수 있어요.
                </p>
            </div>
        </section>
    );
}
