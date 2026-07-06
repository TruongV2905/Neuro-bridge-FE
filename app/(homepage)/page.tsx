import type { Metadata } from "next";
import { HomepageView } from "@/features/homepage";

export const metadata: Metadata = {
  title: "Neuro Bridge",
  description: "Discover AI solutions, experts, and automation workflows.",
};

export default function Homepage() {
  return <HomepageView />;
}
