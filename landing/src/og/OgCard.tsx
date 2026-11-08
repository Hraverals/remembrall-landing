// OG · 트위터 카드(1200×630). 왼쪽 앱 아이콘 · 이름 · Gowun 제목 · 작은 글씨, 오른쪽 08 원래 색 폰(아래로 잘림)과 뒤의 바랜 카드 한 장.
// 폰 화면은 데모와 같은 정지 화면(REDUCED_SNAPSHOT)이다. 버튼 · 진행 막대 · 자막은 넣지 않는다.
import appIcon from "../assets/icon/app-icon.png";
import { photo } from "../assets/photos";
import { DemoScreen } from "../demo/DemoScreen";
import { REDUCED_SNAPSHOT } from "../demo/story";
import { PhoneBody } from "../hero/PhoneFrame";

export function OgCard() {
    return (
        <div className="og" data-og-card>
            <div className="og__copy">
                <div className="og__brand">
                    <img src={appIcon} alt="" width={44} height={44} />
                    <span>REMEMBRALL</span>
                </div>
                <h1 className="og__title">
                    저장만 하고 잊은 곳,
                    <br />
                    근처에서 다시 꺼내드려요.
                </h1>
                <p className="og__note">
                    Android · 카카오테크캠퍼스 4기 충남대 3팀
                </p>
            </div>
            <div className="og__stage">
                <div className="og__memory">
                    <img src={photo(488, "sm")} alt="" />
                </div>
                <div className="phone og__phone">
                    <PhoneBody>
                        <DemoScreen snapshot={REDUCED_SNAPSHOT} />
                    </PhoneBody>
                </div>
            </div>
        </div>
    );
}
