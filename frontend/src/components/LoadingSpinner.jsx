function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="spinner-wrap pro-spinner">
      <div className="spinner-dual">
        <div className="spinner-ring" />
        <span className="spinner-ring spinner-ring-delay" aria-hidden="true" />
      </div>
      <p>{text}</p>
    </div>
  );
}

export default LoadingSpinner;
