import AppWrap from "@/components/common/AppWrap"
import Header from "@/components/layout/Header"
import NavDots, { type NavDotItem } from "@/components/common/NavDots"

import {
  aboutImages,
  activities,
  articles,
  benefits,
  groups,
} from "./data/homepage"
import AboutSection from "./components/AboutSection"
import ActivitiesSection from "./components/SolutionSection"
import BenefitsSection from "./components/TeamsSection"
import BlogSection from "./components/InsightSection"
import GroupsSection from "./components/GroupsSection"
import HeroSection from "./components/HeroSection"
import HomepageFooter from "./components/HomepageFooter"
import HomepageMotion from "./components/HomepageMotion"

const navItems: NavDotItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "activities", label: "AI Solutions" },
  { id: "groups", label: "Teams" },
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
        <GroupsSection groups={groups} />
      </AppWrap>
      <AppWrap id="benefits">
        <BenefitsSection benefits={benefits} />
      </AppWrap>
      <AppWrap id="blog">
        <BlogSection articles={articles} />
      </AppWrap>
      <HomepageFooter />
    </HomepageMotion>
  )
}
