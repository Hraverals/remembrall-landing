import appIcon from "./assets/icon/app-icon.png";
import { Hero } from "./hero/Hero";
import { FadedMemory } from "./sections/FadedMemory";
import { Faq } from "./sections/Faq";
import { HowItWorks } from "./sections/HowItWorks";
import { InstallGuide } from "./sections/InstallGuide";
import { SiteFooter } from "./sections/SiteFooter";
import { TeamSection } from "./sections/TeamSection";

export function App() {
    return (
        <div className="page">
            <header className="site-header">
                <img src={appIcon} alt="" width={28} height={28} />
                <span className="site-header__name">REMEMBRALL</span>
            </header>
            <main>
                <Hero />
                <HowItWorks />
                <FadedMemory />
                <InstallGuide />
                <Faq />
                <TeamSection />
            </main>
            <SiteFooter />
        </div>
    );
}
