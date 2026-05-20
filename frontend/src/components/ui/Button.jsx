// Composant Button réutilisable — à développer
export default function Button({ children, onClick, type = "button", disabled, style }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ padding:"12px 28px", background:"#ff6600", border:"none", borderRadius:"30px",
        color:"#fff", fontSize:"15px", fontWeight:"700", cursor:"pointer", ...style }}>
      {children}
    </button>
  );
}
