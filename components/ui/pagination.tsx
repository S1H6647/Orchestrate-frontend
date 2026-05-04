import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Select } from "@/components/ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalElements,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const from = currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);
  const displayTotal = totalPages > 0 ? Math.max(1, totalPages) : 1;

  if (totalElements === 0) return null;

  return (
    <div className="pagination-bar">
      <div className="pagination-left">
        <div className="pagination-size-selector">
          <div className="pagination-icon-bg">
            <Layers size={14} className="pagination-icon" />
          </div>
          <span className="pagination-label">Rows per page</span>
          <Select
            className="pagination-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </div>

        <div className="pagination-divider" />

        <span className="pagination-info">
          Showing <strong>{from}-{to}</strong> of <strong>{totalElements}</strong> items
        </span>
      </div>

      <div className="pagination-right">
        <div className="pagination-controls">
          <Button
            variant="ghost"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="pagination-page-indicator">
            <span className="pagination-page-label">Page</span>
            <span className="pagination-page-current">{currentPage + 1}</span>
            <span className="pagination-page-slash">/</span>
            <span className="pagination-page-total">{displayTotal}</span>
          </div>
          
          <Button
            variant="ghost"
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
