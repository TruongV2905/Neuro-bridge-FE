import { AiBadge } from "../ui/ai-badge";
import { ExpertMatch } from "../ui/expert-match";
import { ReviewRow } from "../ui/review-row";
import { SkillPill } from "../ui/skill-pill";
import { StepBadge } from "../ui/step-badge";

type Props = {
  projectTitle: string;
  description: string;
  category: string;
  selectedSkills: string[];
  budgetFrom: number;
  budgetTo: number;
  timeline: string;
};

export function ReviewLaunchStep({
  projectTitle,
  description,
  category,
  selectedSkills,
  budgetFrom,
  budgetTo,
  timeline,
}: Props) {
  const plainDescription = description.replace(/<[^>]*>/g, "").trim();

  return (
    <div className="max-w-2xl">
      <div className="flex gap-3">
        <StepBadge step={4} />
        <AiBadge />
      </div>

      <h1 className="mt-6 text-4xl font-extrabold text-black">
        Review and launch
      </h1>

      <p className="mt-1 text-lg text-slate-400">
        Everything looks great — publish to start receiving expert proposals
      </p>

      <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <p className="mb-4 font-bold text-indigo-500">✨ AI PROJECT SUMMARY</p>

        <p className="text-sm leading-6 text-slate-700">
          <b>{projectTitle || "AI Customer Support Chatbot"}</b> —{" "}
          {plainDescription ||
            "an AI chatbot engagement focused on AI Chatbot and API Service."}{" "}
          Budget range{" "}
          <b>
            ${budgetFrom.toLocaleString()} – ${budgetTo.toLocaleString()}
          </b>{" "}
          over <b>{timeline}</b>, published as <b>NDA REQUIRED</b>. AI
          Confidence Score: <b className="text-indigo-500">94%</b>
        </p>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6">
        <h2 className="mb-6 font-bold text-slate-900">PROJECT DETAILS</h2>

        <ReviewRow label="Category" value={category} />

        <ReviewRow
          label="Budget Range"
          value={`$${budgetFrom.toLocaleString()} – $${budgetTo.toLocaleString()}`}
        />

        <ReviewRow label="Timeline" value={timeline} />

        <ReviewRow
          label="Skills Required"
          value={`${selectedSkills.length} skills selected`}
        />

        <ReviewRow label="Deliverables" value="3 items" />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6">
        <h2 className="mb-4 font-bold text-slate-900">REQUIRED SKILLS</h2>

        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <SkillPill key={skill} active>
              {skill}
            </SkillPill>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">TOP EXPERT MATCHES</h2>
          <p className="text-sm text-indigo-500">30 verified experts ready</p>
        </div>

        <ExpertMatch name="Sarah Chen" role="AI & ML Engineer" score="98%" />
        <ExpertMatch name="Marcus Webb" role="LangChain Specialist" score="96%" />
        <ExpertMatch
          name="Priya Sharma"
          role="Conversational AI Dev"
          score="94%"
        />
      </div>
    </div>
  );
}