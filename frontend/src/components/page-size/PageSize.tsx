const PAGE_SIZE_OPTIONS: readonly number[] = [5, 20, 50];

type PageSizeProps = {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

export default function PageSize({ pageSize, onPageSizeChange }: PageSizeProps) {
  return (
    <div className="page-size center">
      <span className="field-label">Page size</span>
      {PAGE_SIZE_OPTIONS.map((size) => (
        <button
          key={size}
          type="button"
          className={size === pageSize ? 'page-size-btn center active' : 'page-size-btn center'}
          onClick={() => onPageSizeChange(size)}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
