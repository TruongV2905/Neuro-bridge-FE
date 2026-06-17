import { TableAction } from "@/components/dashboard/table/DataTable";
import { User, UserStatus } from "@/types/user/user.type";
import { Ban, CheckCircle, CirclePause } from "lucide-react";

export const userCustomActions: TableAction<User>[] = [
  {
    type: "custom",
    label: "Activate",
    actionKey: "activateUser",
    hidden: (row) => row.status === UserStatus.ACTIVE || row.role === "ADMIN",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    type: "custom",
    label: "Inactive",
    actionKey: "inactiveUser",
    hidden: (row) => row.status === UserStatus.INACTIVE || row.role === "ADMIN",
    className:
      "text-yellow-700 focus:bg-yellow-50 focus:text-yellow-900 data-[highlighted]:bg-yellow-50 data-[highlighted]:text-yellow-900",
    icon: <CirclePause className="h-4 w-4" />,
  },
  {
    type: "custom",
    label: "Ban",
    actionKey: "banUser",
    hidden: (row) => row.status === UserStatus.BANNED || row.role === "ADMIN",
    icon: <Ban className="h-4 w-4" />,
    variant: "destructive",
  },
];
