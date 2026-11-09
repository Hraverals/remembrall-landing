// 만든 사람들(#team). 데이터는 team.ts 하나다(대소문자만 다른 이름이 Windows 에서 부딪혀 컴포넌트는 TeamSection 이다). 이름이 빈 항목은 빼고, 남는 사람이 없으면 섹션 전체를 그리지 않는다(빈 자리표시가 배포 화면에 나오지 않게).
// 한 사람당 한 줄: 이름 · 역할 · "GitHub" 글자 링크(새 탭). 아바타 · 카드 · 로고는 없다.
import { TEAM } from "./team";

export function TeamSection() {
    const members = TEAM.filter((member) => member.name.trim() !== "");
    if (members.length === 0) return null;
    return (
        <section id="team" className="section" aria-labelledby="team-title">
            <h2 id="team-title" className="section__title">
                만든 사람들
            </h2>
            <p className="section__lead">카카오테크캠퍼스 4기 충남대 3팀</p>
            <ul className="team">
                {members.map((member) => {
                    const github = member.github.trim().replace(/^@/, "");
                    return (
                        <li key={member.name} className="team__member">
                            <span className="team__name">{member.name}</span>
                            <span className="team__role">{member.role}</span>
                            {github !== "" && (
                                <a
                                    className="team__link"
                                    href={`https://github.com/${encodeURIComponent(github)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub
                                </a>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
