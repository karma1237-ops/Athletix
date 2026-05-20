// Composant Spinner réutilisable
export default function Spinner() {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}>
      <div style={{ width:36, height:36, border:"3px solid rgba(255,102,0,0.2)",
        borderTop:"3px solid #ff6600", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    </div>
  );
}
