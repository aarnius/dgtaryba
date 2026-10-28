"use client";

export default function Error({ error, reset }) {
  return (
    <div className="card empty" style={{ maxWidth: 520, margin: "48px auto" }}>
      <span className="big">😵</span>
      <h3 style={{ marginTop: 8 }}>Kažkas nepavyko</h3>
      <p className="muted small" style={{ margin: "0 0 16px" }}>
        Pabandyk dar kartą po minutės. Jei kartojasi, pranešk tarybai.
        {error?.digest && <><br />Kodas: <span className="mono">{error.digest}</span></>}
      </p>
      <button className="btn" onClick={() => reset()}>Bandyti dar kartą</button>
    </div>
  );
}
