import './Pagination.css';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const SIBLING_COUNT: number = 2;
const BOUNDARY_COUNT: number = 1;

function buildPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages = new Set<number>();

  for (let i = 1; i <= BOUNDARY_COUNT; i++) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i);
    }
  }

  for (let i = totalPages - BOUNDARY_COUNT + 1; i <= totalPages; i++) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i);
    }
  }

  for (let i = currentPage - SIBLING_COUNT; i <= currentPage + SIBLING_COUNT; i++) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i);
    }
  }

  const sortedPages: number[] = Array.from(pages).sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];

  sortedPages.forEach((page, index) => {
    if (index > 0) {
      const gap = page - sortedPages[index - 1];

      if (gap > 1) {
        result.push('ellipsis');
      }
    }
    result.push(page);
  });

  return result;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="pagination center">
      {buildPageNumbers(currentPage, totalPages).map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis center">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className={page === currentPage ? 'bar-btn bar-control center active' : 'bar-btn bar-control center'}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ),
      )}
    </div>
  );
}
