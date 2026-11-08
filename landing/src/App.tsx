import appIcon from "./assets/icon/app-icon.png";
import { Hero } from "./hero/Hero";

export function App() {
    return (
        <div className="page">
            <header className="site-header">
                <img src={appIcon} alt="" width={28} height={28} />
                <span className="site-header__name">REMEMBRALL</span>
            </header>
            <main>
                <Hero />
            </main>
        </div>
    );
}
