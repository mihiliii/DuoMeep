import './PaginationBar.css';

import GoToPage from '@/components/pagination-bar/go-to-page/GoToPage';
import PageSize from '@/components/pagination-bar/page-size/PageSize';
import Pagination from '@/components/pagination-bar/pagination/Pagination';

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

export default function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: PaginationBarProps) {
  return (
    <div className="pagination-bar">
      <PageSize pageSize={pageSize} onPageSizeChange={onPageSizeChange} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      <GoToPage totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
