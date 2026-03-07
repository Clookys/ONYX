export default function Demo({ onBackToLanding, onOpenRadar }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        color: "#fff",
        fontFamily: "'Outfit', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 20,
          border: "1px solid #ffffff14",
          background: "linear-gradient(135deg, rgba(0,240,255,0.08), rgba(176,38,255,0.08))",
          padding: "56px 40px",
          textAlign: "center",
          boxShadow: "0 0 70px rgba(0,240,255,0.12)",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: 3,
            color: "#00f0ff99",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          ◈ Démo produit
        </div>

        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            letterSpacing: 4,
            marginBottom: 16,
            background: "linear-gradient(90deg, #00f0ff, #b026ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ONYX DEMO
        </h1>

        <p
          style={{
            color: "#ffffffb3",
            fontSize: 17,
            lineHeight: 1.7,
            maxWidth: 620,
            margin: "0 auto 36px",
          }}
        >
          Vous êtes dans l'espace de démonstration. Passez à l'interface ONYX Radar pour explorer
          la collecte en temps réel et le flux d'alertes.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onOpenRadar}
            style={{
              padding: "14px 30px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #00f0ff, #0080ff)",
              color: "#050508",
              fontWeight: 700,
              letterSpacing: 1,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Ouvrir ONYX Radar →
          </button>

          <button
            onClick={onBackToLanding}
            style={{
              padding: "14px 30px",
              borderRadius: 12,
              border: "1px solid #ffffff26",
              background: "rgba(255,255,255,0.03)",
              color: "#ffffffcc",
              fontWeight: 500,
              letterSpacing: 1,
              cursor: "pointer",
            }}
          >
            ← Retour landing
          </button>
        </div>
      </div>
    </div>
  );
}
