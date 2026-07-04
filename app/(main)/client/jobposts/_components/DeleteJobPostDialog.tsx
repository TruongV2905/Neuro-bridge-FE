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
import { useDeleteJobPost } from "@/services/jobpost.service";
import type { JobPostResponse } from "@/types/jobpost.types";

type Props = {
  jobPost: JobPostResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteJobPostDialog({
  jobPost,
  open,
  onOpenChange,
}: Props) {
  const deleteMutation = useDeleteJobPost();

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!jobPost) return;

    deleteMutation.mutate(
      {
        pathParams: {
          id: jobPost.id,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã xóa job post!");
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message ??
              "Xóa job post thất bại. Kiểm tra lại BE nhé.",
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
          <AlertDialogTitle>Xóa job post?</AlertDialogTitle>
          <AlertDialogDescription>
            “{jobPost?.title}” sẽ bị xóa. Expert sẽ không còn thấy hoặc ứng
            tuyển vào job post này nữa.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
