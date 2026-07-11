import AppWrap from "@/components/common/AppWrap"
import Header from "@/components/layout/Header"
import NavDots, { type NavDotItem } from "@/components/common/NavDots"

import {
  aboutImages,
  activities,
  articles,
  benefits,
} from "./data/homepage"
import AboutSection from "./components/AboutSection"
import ActivitiesSection from "./components/SolutionSection"
import BenefitsSection from "./components/BenefitsSection"
import HeroSection from "./components/HeroSection"
import HomepageFooter from "./components/HomepageFooter"
import HomepageMotion from "./components/HomepageMotion"
import InsightsSection from "./components/InsightsSection"
import ProjectJourneySection from "./components/ProjectJourneySection"

const navItems: NavDotItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "activities", label: "AI Solutions" },
  { id: "groups", label: "Project Journey" },
  { id: "benefits", label: "Benefits" },
  { id: "blog", label: "Insights" },
]

export function HomepageView() {
  return (
    <HomepageMotion>
      <Header />
      <NavDots items={navItems} />
      <AppWrap id="home">
        <HeroSection />
      </AppWrap>
      <AppWrap id="about">
        <AboutSection images={aboutImages} />
      </AppWrap>
      <AppWrap id="activities">
        <ActivitiesSection activities={activities} />
      </AppWrap>
      <AppWrap id="groups">
        <ProjectJourneySection />
      </AppWrap>
      <AppWrap id="benefits">
        <BenefitsSection benefits={benefits} />
      </AppWrap>
      <AppWrap id="blog">
        <InsightsSection articles={articles} />
      </AppWrap>
      <HomepageFooter />
    </HomepageMotion>
  )
}
