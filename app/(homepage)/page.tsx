import type { Metadata } from "next";
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
  title: "Incredible Adventure | Neuro Bridge",
  description: "Discover AI-powered adventures and automation workflows.",
};

export default function Homepage() {
  return (
    <HomepageMotion>
      <HeroSection />
      <AboutSection images={aboutImages} />
      <ActivitiesSection activities={activities} />
      <GroupsSection groups={groups} />
      <BenefitsSection benefits={benefits} />
      <BlogSection articles={articles} />
      <HomepageFooter />
    </HomepageMotion>
  )
}
