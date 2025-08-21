import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    let startPage, endPage;
    if (currentPage <= 3) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + 1 >= totalPages) {
      startPage = totalPages - (maxPagesToShow - 1);
      endPage = totalPages;
    } else {
      startPage = currentPage - 2;
      endPage = currentPage + 2;
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  return (
    <nav aria-label="Pagination" className="flex justify-center items-center space-x-2">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="border-2 border-slate-200 hover:border-primary hover:bg-primary/10"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <div className="flex space-x-1">
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            onClick={() => onPageChange(pageNum)}
            className={`w-12 h-12 p-0 ${
              currentPage === pageNum
                ? "bg-primary text-primary-foreground border-0"
                : "border-2 border-slate-200 hover:border-primary hover:bg-primary/10"
            }`}
          >
            {pageNum}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border-2 border-slate-200 hover:border-primary hover:bg-primary/10"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </nav>
  );
}
