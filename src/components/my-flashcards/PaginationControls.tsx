import type { Pagination } from "../../types";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ pagination, onPageChange }: PaginationControlsProps) => {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  // If there's only one page, don't show pagination
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  // Calculate page range for display
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{total}</span> flashcards
      </p>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <div className="text-sm">
          Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
