"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROUTES } from "@/constants/routes";
import { useHireExpert } from "@/services/apply.service";

interface Props {
  jobPostId: string;
  expertApplyId: string | null;
  expertName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HireConfirmDialog({
  jobPostId,
  expertApplyId,
  expertName,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const hireMutation = useHireExpert();

  const handleHire = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!expertApplyId) return;

    hireMutation.mutate(
      { pathParams: { jobPostId, expertApplyId } },
      {
        onSuccess: (res) => {
          toast.success(`Đã thuê ${expertName}!`);
          onOpenChange(false);
          const workspaceId = res?.result?.workspaceId;
          if (workspaceId) {
            router.push(ROUTES.CHAT_ROOM(workspaceId));
          }
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ?? "Không thuê được, thử lại nhé.",
          );
        },
      },
    );
  };

  const isHiring = hireMutation.isPending;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Thuê {expertName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Sau khi thuê, job post sẽ đóng lại và hệ thống tạo workspace để 2 bên
            cùng làm việc. Bạn sẽ được đưa vào workspace ngay.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isHiring}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={handleHire} disabled={isHiring}>
            {isHiring ? "Đang xử lý..." : "Xác nhận thuê"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
