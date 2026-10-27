export default function ErrorBox({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="alert" role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="btn btn-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
