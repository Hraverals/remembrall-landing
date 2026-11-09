// 번호 목록. 이렇게 써요 · 설치 안내가 같이 쓴다(아이콘 · 카드 없음, 줄 사이 얇은 선).
// compact: 번호 · 소제목 · 본문 · 줄 간격을 한 단계 작게 해 위계를 나눈다(설치 안내).
export type Step = { number: string; title: string; body: string };

type Props = {
    steps: readonly Step[];
    compact?: boolean;
};

export function StepList({ steps, compact = false }: Props) {
    return (
        <ol className={compact ? "steps steps--compact" : "steps"}>
            {steps.map((step) => (
                <li key={step.number} className="steps__item">
                    <span className="steps__number" aria-hidden="true">
                        {step.number}
                    </span>
                    <div>
                        <h3 className="steps__title">{step.title}</h3>
                        <p className="steps__body">{step.body}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}
