import {
  aiCategories,
  requiredSkillOptions,
  timelineOptions,
} from "../../_constants/job-post.constants";
import { AiBadge } from "../ui/ai-badge";
import { jobPostInteractiveCardClassName } from "../ui/form-field-styles";
import { SkillPill } from "../ui/skill-pill";
import { StepBadge } from "../ui/step-badge";

type Props = {
  category: string;
  selectedSkills: string[];
  budgetFrom: number;
  budgetTo: number;
  timeline: string;
  onCategoryChange: (value: string) => void;
  onToggleSkill: (skill: string) => void;
  onBudgetFromChange: (value: number) => void;
  onBudgetToChange: (value: number) => void;
  onTimelineChange: (value: string) => void;
};

export function ConfigurationStep({
  category,
  selectedSkills,
  budgetFrom,
  budgetTo,
  timeline,
  onCategoryChange,
  onToggleSkill,
  onBudgetFromChange,
  onBudgetToChange,
  onTimelineChange,
}: Props) {
  return (
    <div className="max-w-3xl">
      <div className="flex gap-3">
        <StepBadge step={3} />
        <AiBadge />
      </div>

      <h1 className="mt-6 text-4xl font-extrabold text-black">
        Configure your requirements
      </h1>

      <p className="mt-1 text-lg text-slate-400">
        Customize the AI suggestions to match your exact needs and constraints
      </p>

      <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-500">
        ✨ AI pre-filled suggestions based on your description — customize as
        needed
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">AI Category</h2>

        <div className="grid grid-cols-4 gap-3">
          {aiCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onCategoryChange(item)}
              className={`rounded-2xl border px-4 py-4 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                category === item
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_4px_20px_rgba(99,102,241,0.15)]"
                  : `${jobPostInteractiveCardClassName} border-transparent text-slate-700`
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Required Skills</h2>
          <p className="text-sm text-indigo-500">
            {selectedSkills.length} selected
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {requiredSkillOptions.map((skill) => (
            <button key={skill} onClick={() => onToggleSkill(skill)}>
              <SkillPill active={selectedSkills.includes(skill)}>
                {skill}
              </SkillPill>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Budget Range</h2>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-4 py-1 text-sm font-bold text-indigo-500">
              ${Math.round(budgetFrom / 1000)}K
            </span>
            <span className="text-slate-300">—</span>
            <span className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1 text-sm font-bold text-white">
              ${Math.round(budgetTo / 1000)}K
            </span>
          </div>
        </div>

        <div className={`rounded-2xl p-6 ${jobPostInteractiveCardClassName}`}>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={budgetFrom}
            onChange={(e) => onBudgetFromChange(Number(e.target.value))}
            className="w-full"
          />

          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={budgetTo}
            onChange={(e) => onBudgetToChange(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Timeline</h2>

          <span className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1 text-sm font-bold text-white">
            {timeline}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {timelineOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onTimelineChange(item)}
              className={`rounded-2xl px-4 py-4 font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                timeline === item
                  ? "bg-indigo-500 text-white shadow-[0_6px_24px_rgba(99,102,241,0.35)]"
                  : `${jobPostInteractiveCardClassName} text-slate-600`
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}