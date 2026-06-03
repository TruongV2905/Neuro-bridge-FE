import { Bell, MessageSquare, Mic, Search, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IconBox } from "./icon-box"
import { UserProfile } from "../../../../types/profile-types"

export function ProfileHeader({ user }: { user: UserProfile }) {
  return (
    <header className="h-[56px] bg-primary text-primary-foreground px-4 shadow-sm">
      <div className="flex h-full items-center justify-between">
        <div className="text-xl font-bold tracking-wide">
          Neuro<span className="text-secondary">Bridge</span>
          <p className="text-[10px] font-normal text-primary-foreground/70">
            AI Project Collaboration Platform
          </p>
        </div>

        <div className="hidden h-10 w-[360px] items-center rounded-xl bg-primary-foreground/10 px-4 text-primary-foreground/80 md:flex">
          <span className="mr-2 text-sm text-secondary">✧</span>
          <input
            className="w-full bg-transparent text-xs outline-none placeholder:text-primary-foreground/50 text-primary-foreground"
            placeholder="Ask AI to manage your projects"
          />
          <Mic size={16} className="mr-3 opacity-80" />
          <Search size={17} />
        </div>

        <div className="flex items-center gap-3">
          <IconBox><Bell size={16} /></IconBox>
          <IconBox><MessageSquare size={16} /></IconBox>
          <IconBox><Sun size={16} /></IconBox>

          <Button
            variant="ghost"
            className="h-10 gap-3 rounded-xl bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover border border-primary-foreground/20"
            />
            <div className="hidden max-w-[120px] text-left leading-tight sm:block">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="truncate text-[10px] text-primary-foreground/70">{user.role}</p>
            </div>
          </Button>
        </div>
      </div>
    </header>
  )
}