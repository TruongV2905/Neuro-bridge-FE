import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;

  pageSize: number;
  pageSizeOptions: number[];

  totalItems: number;

  startItem: number;
  endItem: number;

  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  const renderPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-end gap-4 px-4 py-4">
      {/* RIGHT */}
      <div className="flex items-center gap-1">
        <Button
          className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {renderPages().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-sm">
              ...
            </span>
          ) : (
            <Button
              key={index}
              onClick={() => onPageChange(Number(page))}
              className={`rounded-md border px-3 py-1 text-sm ${
                currentPage === page ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          className="rounded-md border px-3   py-1 text-sm disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
