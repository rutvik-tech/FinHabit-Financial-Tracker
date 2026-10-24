function Card({ children, className = "" }) {
  return (
    <div className={`reusable-card ${className}`}>
      {children}
    </div>
  );
}

export default Card;