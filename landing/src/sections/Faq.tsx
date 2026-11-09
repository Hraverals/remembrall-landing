// 자주 묻는 질문(#faq). 질문마다 <details>/<summary> 로 접고 편다(JS 없음, 처음엔 모두 접힘).
// 답은 앱 레포 develop 코드로 확인한 내용만 쓴다. 숫자(쿨다운 기간 등)는 넣지 않는다.
// - 위치 전송: GET /api/geofences(근처 장소 목록) · POST /api/location-events(도착 보고) 두 곳뿐
// - 알림 중복: 백엔드가 최근 제안한 곳을 빼고 회원 쿨다운을 둔다
const QUESTIONS = [
    {
        question: "아이폰도 되나요?",
        answer: "지금은 Android만 돼요.",
    },
    {
        question: "위치를 계속 보내나요?",
        answer: "아니요. 위치를 계속 기록하지 않아요. 근처 장소 목록을 새로 받을 때와, 저장한 곳에 도착했을 때만 위치를 서버로 보내요.",
    },
    {
        question: "알림이 너무 자주 오지 않나요?",
        answer: "최근에 알려드린 곳은 다시 알리지 않아요.",
    },
    {
        question: "로그인해야 하나요?",
        answer: "아니요. 따로 가입하지 않고 바로 시작해요.",
    },
    {
        question: "장소를 못 찾으면요?",
        answer: "어디인지 확실하지 않으면 한 번 물어봐요. 끝내 찾지 못하면 '장소 없음'으로 남고, 기억 탭에서 길게 눌러 지울 수 있어요.",
    },
] as const;

export function Faq() {
    return (
        <section
            id="faq"
            className="section section--split section--follow"
            aria-labelledby="faq-title"
        >
            <h2 id="faq-title" className="section__title">
                자주 묻는 질문
            </h2>
            <div className="faq">
                {QUESTIONS.map((item) => (
                    <details key={item.question} className="faq__item">
                        <summary className="faq__question">
                            {item.question}
                            <span className="faq__mark" aria-hidden="true" />
                        </summary>
                        <p className="faq__answer">{item.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    );
}
