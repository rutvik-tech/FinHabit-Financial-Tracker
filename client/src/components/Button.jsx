function Button({ children, className = "", onClick, type = "button" }) {
  return (
    <button
      type={type}
      className={`reusable-button ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;