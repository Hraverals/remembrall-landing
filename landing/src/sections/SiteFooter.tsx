// 푸터. 앱 이름 · 팀 · 문서 · 앱 레포 링크, 그 아래 작은 글씨로 사진 크레딧(credits.json, Unsplash)과 예시 사진 고지.
import credits from "../assets/photos/credits.json";
import { APP_REPO_URL, TECH_SPEC_PATH } from "../links";

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <div className="site-footer__row">
                <span className="site-footer__name">REMEMBRALL</span>
                <span>카카오테크캠퍼스 4기 충남대 3팀</span>
                <a className="site-footer__link" href={TECH_SPEC_PATH}>
                    기술 문서
                </a>
                <a className="site-footer__link" href={APP_REPO_URL}>
                    GitHub에서 앱 코드 보기
                </a>
            </div>
            <p className="site-footer__credits">
                사진:{" "}
                {credits.map((credit, index) => (
                    <span key={credit.id}>
                        {index > 0 && ", "}
                        <a href={credit.source}>{credit.author}</a>
                    </span>
                ))}{" "}
                · Unsplash. 데모 속 사진은 장소와 관계없는 예시예요.
            </p>
        </footer>
    );
}
