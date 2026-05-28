import type { Metadata } from "next";
import AppWrap from "@/components/common/AppWrap"
import Header from "@/components/layout/Header"
import NavDots, { type NavDotItem } from "@/components/common/NavDots"
import {
  aboutImages,
  activities,
  articles,
  benefits,
  groups,
} from "./_data/homepage"
import AboutSection from "./_components/AboutSection"
import ActivitiesSection from "./_components/SolutionSection"
import BenefitsSection from "./_components/TeamsSection"
import BlogSection from "./_components/InsightSection"
import GroupsSection from "./_components/GroupsSection"
import HeroSection from "./_components/HeroSection"
import HomepageFooter from "./_components/HomepageFooter"
import HomepageMotion from "./_components/HomepageMotion"

export const metadata: Metadata = {
  title: "Neuro Bridge",
  description: "Discover AI solutions, experts, and automation workflows.",
};

const navItems: NavDotItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "activities", label: "AI Solutions" },
  { id: "groups", label: "Teams" },
  { id: "benefits", label: "Benefits" },
  { id: "blog", label: "Insights" },
]

export default function Homepage() {
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
