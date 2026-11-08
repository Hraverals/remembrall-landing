// 이렇게 써요. 01 · 02 · 03 번호 목록(아이콘 · 카드 없음). 데스크톱은 제목 | 목록 2열, 좁은 화면은 쌓는다.
// 문구는 앱이 하는 일만 쓴다: 공유 → 장소 찾기(확실하지 않으면 확인 질문, 앱 02 · 02b) → 위치 · 알림 권한이 있으면 근처에서 알림.
const STEPS = [
    {
        number: "01",
        title: "공유해요",
        body: "Shorts에서 가 보고 싶은 곳이 나오면, 공유 버튼을 눌러 REMEMBRALL을 골라요.",
    },
    {
        number: "02",
        title: "기억해 둬요",
        body: "영상 속 장소를 찾으면 기억 탭에 넣어둬요. 어디인지 확실하지 않으면 한 번 물어봐요.",
    },
    {
        number: "03",
        title: "근처에서 다시",
        body: "위치와 알림을 허용해 두면, 저장한 곳 근처에 갔을 때 알림으로 다시 꺼내드려요.",
    },
] as const;

export function HowItWorks() {
    return (
        <section className="section how" aria-labelledby="how-title">
            <h2 id="how-title" className="section__title">
                이렇게 써요
            </h2>
            <ol className="how__list">
                {STEPS.map((step) => (
                    <li key={step.number} className="how__step">
                        <span className="how__number" aria-hidden="true">
                            {step.number}
                        </span>
                        <div>
                            <h3 className="how__title">{step.title}</h3>
                            <p className="how__body">{step.body}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}
