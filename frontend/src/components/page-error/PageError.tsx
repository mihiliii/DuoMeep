type PageErrorProps = {
  message: string;
};

export default function PageError({ message }: PageErrorProps) {
  return (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p>{message}</p>
    </div>
  );
}
