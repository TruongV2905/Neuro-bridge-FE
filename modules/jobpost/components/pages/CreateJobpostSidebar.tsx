// // modules/jobpost/components/page/CreateJobpostSidebar.tsx

// "use client"

// import { Bot, BriefcaseBusiness, ClipboardCheck, Rocket } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"

// import { JOBPOST_STEPS } from "../../constants/jobpost.constants"
// import type { CreateJobpostStep } from "../../types/create-jobpost-wizard.type"

// type CreateJobpostSidebarProps = {
//   currentStep: CreateJobpostStep
//   onSaveDraft?: () => void
// }

// const stepIcons = {
//   1: BriefcaseBusiness,
//   2: Bot,
//   3: ClipboardCheck,
//   4: Rocket,
// }

// export function CreateJobpostSidebar({
//   currentStep,
//   onSaveDraft,
// }: CreateJobpostSidebarProps) {
//   const progress = currentStep * 25

//   return (
//     <aside className="flex h-full w-72 shrink-0 flex-col border-r bg-white px-5 py-6">
//       <div className="space-y-2">
//         <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
//           <span>Progress</span>
//           <span className="text-primary">{progress}%</span>
//         </div>

//         <Progress value={progress} className="h-2" />
//       </div>

//       <div className="mt-6 space-y-3">
//         {JOBPOST_STEPS.map((step) => {
//           const Icon = stepIcons[step.id]
//           const isActive = step.id === currentStep
//           const isCompleted = step.id < currentStep

//           return (
//             <div
//               key={step.id}
//               className={[
//                 "flex items-center gap-3 rounded-2xl px-3 py-3 transition",
//                 isActive
//                   ? "bg-primary/10 text-slate-950"
//                   : isCompleted
//                     ? "bg-slate-50 text-slate-800"
//                     : "bg-slate-50 text-slate-500",
//               ].join(" ")}
//             >
//               <div
//                 className={[
//                   "flex h-9 w-9 items-center justify-center rounded-xl text-white",
//                   isActive || isCompleted
//                     ? "bg-gradient-to-br from-primary to-fuchsia-500"
//                     : "bg-slate-300",
//                 ].join(" ")}
//               >
//                 <Icon className="h-4 w-4" />
//               </div>

//               <div className="min-w-0">
//                 <p className="text-sm font-semibold">{step.title}</p>
//                 <p className="truncate text-xs text-slate-400">
//                   {step.description}
//                 </p>
//               </div>
//             </div>
//           )
//         })}
//       </div>

//       <div className="mt-auto space-y-4">
//         <Button
//           type="button"
//           variant="ghost"
//           className="w-full rounded-xl text-slate-500"
//           onClick={onSaveDraft}
//         >
//           Save Draft
//         </Button>

//         <div className="rounded-2xl bg-primary/10 p-4">
//           <div className="mb-2 flex items-center justify-between text-xs font-semibold">
//             <span className="text-primary">AI Confidence</span>
//             <span className="text-primary">94%</span>
//           </div>

//           <Progress value={94} className="h-2" />
//         </div>
//       </div>
//     </aside>
//   )
// }

"use client"

import {
  Bot,
  BriefcaseBusiness,
  Rocket,
  Settings2,
} from "lucide-react"

import { JOBPOST_STEPS } from "../../constants/jobpost.constants"
import type { CreateJobpostStep } from "../../types/create-jobpost-wizard.type"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type CreateJobpostSidebarProps = {
  currentStep: CreateJobpostStep
  aiConfidence?: number
  onSaveDraft?: () => void
}

const stepIcons = [BriefcaseBusiness, Bot, Settings2, Rocket]

export function CreateJobpostSidebar({
  currentStep,
  aiConfidence = 94,
  onSaveDraft,
}: CreateJobpostSidebarProps) {
  const progress = currentStep * 25

  return (
    <aside className="flex h-screen w-[290px] shrink-0 flex-col border-r bg-white px-5 py-7">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          <span>Progress</span>
          <span className="tracking-normal text-primary">{progress}%</span>
        </div>

        <Progress value={progress} className="h-2" />
      </div>

      <nav className="mt-8 space-y-2">
        {JOBPOST_STEPS.map((step, index) => {
          const Icon = stepIcons[index]
          const isActive = currentStep === step.id

          return (
            <div
              key={step.id}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 transition",
                isActive
                  ? "bg-primary/10 text-zinc-950"
                  : "bg-zinc-100/70 text-zinc-600",
              ].join(" ")}
            >
              <div
                className={[
                  "flex size-10 items-center justify-center rounded-full text-white",
                  isActive
                    ? "bg-gradient-to-br from-primary to-fuchsia-500"
                    : "bg-gradient-to-br from-indigo-500 to-violet-500",
                ].join(" ")}
              >
                <Icon size={18} />
              </div>

              <div>
                <p className="text-sm font-bold">{step.title}</p>
                <p className="text-xs text-zinc-500">{step.description}</p>
              </div>
            </div>
          )
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <Button
          type="button"
          variant="ghost"
          className="w-full text-zinc-500"
          onClick={onSaveDraft}
        >
          Save Draft
        </Button>

        <div className="rounded-2xl bg-primary/10 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span className="text-primary">AI Confidence</span>
            <span className="text-primary">{aiConfidence}%</span>
          </div>

          <Progress value={aiConfidence} className="h-2" />
        </div>
      </div>
    </aside>
  )
}