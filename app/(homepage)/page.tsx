import type { Metadata } from "next";
import AppWrap from "@/components/common/AppWrap"
import NavDots, { type NavDotItem } from "@/components/common/NavDots"
import {
  aboutImages,
  activities,
  articles,
  benefits,
  groups,
} from "./_data/homepage"
import AboutSection from "./_components/AboutSection"
import ActivitiesSection from "./_components/ActivitiesSection"
import BenefitsSection from "./_components/BenefitsSection"
import BlogSection from "./_components/BlogSection"
import GroupsSection from "./_components/GroupsSection"
import HeroSection from "./_components/HeroSection"
import HomepageFooter from "./_components/HomepageFooter"
import HomepageMotion from "./_components/HomepageMotion"

export const metadata: Metadata = {
  title: "Neuro Bridge",
  description: "Discover AI-powered adventures and automation workflows.",
};

const navItems: NavDotItem[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "activities", label: "Activities" },
  { id: "groups", label: "Groups" },
  { id: "benefits", label: "Benefits" },
  { id: "blog", label: "Blog" },
]

export default function Homepage() {
  return (
    <HomepageMotion>
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
