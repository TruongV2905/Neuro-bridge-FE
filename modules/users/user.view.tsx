import {
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  Home,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  VenusAndMars,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import type { User } from "@/types/user/user.type";
import { useGetSkillById } from "@/services/skill.service";

function getInitials(name?: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getRoleBadgeClass(role?: string) {
  switch (role) {
    case "ADMIN":
      return "bg-violet-100 text-violet-700 hover:bg-violet-100";
    case "EXPERT":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "CLIENT":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted";
  }
}

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    case "BANNED":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    case "INACTIVE":
      return "bg-zinc-100 text-zinc-600 hover:bg-zinc-100";
    default:
      return "bg-muted text-muted-foreground hover:bg-muted";
  }
}

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium text-foreground">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};
type SkillBadgeProps = {
  skillId: number;
};

function SkillBadge({ skillId }: SkillBadgeProps) {
  const { data, isLoading, isError } = useGetSkillById({
    id: skillId,
  });

  const skill = data?.result;

  if (isLoading) {
    return (
      <Badge variant="outline" className="rounded-full px-3 py-1">
        Loading...
      </Badge>
    );
  }

  if (isError || !skill) {
    return;
  }

  return (
    <Badge variant="outline" className="rounded-full px-3 py-1">
      {skill?.skillName}
    </Badge>
  );
}
function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function UserView({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="overflow-hidden shadow-none">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-muted/70 via-background to-muted/40 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center ">
              <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback className="text-lg font-bold">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-bold">
                      {user.fullName}
                    </h3>

                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getRoleBadgeClass(user.role)}>
                      {user.role}
                    </Badge>

                    <Badge className={getStatusBadgeClass(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IdCard className="h-4 w-4" />
                    <span className="truncate">{user.code || "No code"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="truncate">{user.phone || "No phone"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <SectionCard
        title="Basic Information"
        description="Personal and contact information"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoItem
            icon={<IdCard className="h-4 w-4" />}
            label="ID"
            value={user.id}
          />

          <InfoItem
            icon={<CircleUserRound className="h-4 w-4" />}
            label="Code"
            value={user.code}
          />

          <InfoItem
            icon={<UserRound className="h-4 w-4" />}
            label="Full Name"
            value={user.fullName}
          />

          <InfoItem
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={user.email}
          />

          <InfoItem
            icon={<Phone className="h-4 w-4" />}
            label="Phone"
            value={user.phone}
          />

          <InfoItem
            icon={<VenusAndMars className="h-4 w-4" />}
            label="Gender"
            value={user.gender}
          />

          <InfoItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="Date of Birth"
            value={user.dateOfBirth}
          />

          <InfoItem
            icon={<CalendarDays className="h-4 w-4" />}
            label="Created At"
            value={user.createdAt}
          />
        </div>
      </SectionCard>

      {/* Account Information */}
      <SectionCard title="Account Information" description="Role and status">
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoItem
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Role"
            value={user.role}
          />

          <InfoItem
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Status"
            value={user.status}
          />

          <div className="sm:col-span-2">
            <InfoItem
              icon={<Home className="h-4 w-4" />}
              label="Address"
              value={user.address}
            />
          </div>
        </div>
      </SectionCard>

      {/* Client Information */}
      {user.role === "CLIENT" && (
        <SectionCard
          title="Client Information"
          description="Company and business profile"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoItem
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              label="Company Name"
              value={user.companyName}
            />

            <InfoItem
              icon={<BriefcaseBusiness className="h-4 w-4" />}
              label="Industry"
              value={user.industry}
            />

            <div className="sm:col-span-2">
              <InfoItem
                icon={<BriefcaseBusiness className="h-4 w-4" />}
                label="Company Description"
                value={user.companyDescription}
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Expert Information */}
      {user.role === "EXPERT" && (
        <SectionCard
          title="Expert Information"
          description="Skills and expert profile"
        >
          {user.skillIds && user.skillIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skillIds.map((skillId) => (
                <SkillBadge key={skillId} skillId={skillId} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No skills</p>
          )}
        </SectionCard>
      )}
    </div>
  );
}
