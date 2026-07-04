"use client";

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
import { useDeleteProposal } from "@/services/proposal.service";
import type { ProposalResponse } from "@/types/proposal.types";

interface Props {
  proposal: ProposalResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteProposalDialog({
  proposal,
  open,
  onOpenChange,
}: Props) {
  const deleteMutation = useDeleteProposal();

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!proposal) return;

    deleteMutation.mutate(
      { pathParams: { id: proposal.id } },
      {
        onSuccess: () => {
          toast.success("Đã xóa đề xuất!");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err?.response?.data?.message ?? "Xóa thất bại. Thử lại nhé.",
          );
        },
      },
    );
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa đề xuất?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{proposal?.title}&rdquo; sẽ bị xóa vĩnh viễn. Client sẽ không
            thấy đề xuất này nữa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
