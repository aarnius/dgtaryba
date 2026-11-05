import Ransom from "./Ransom";
import { UnlockForm } from "./LockForms";

export default function LockScreen({ title, message, eta, hasPassword }) {
  return (
    <div className="lock-screen">
      <div className="lock-inner">
        <div className="lock-icon" aria-hidden>🛠️</div>
        <Ransom text={title || "Atnaujiname"} className="sm" seed={7} as="h1" />
        <p className="lock-message">{message}</p>
        {eta && <p className="lock-eta">⏱️ {eta}</p>}
        <p className="muted small">Kauno Stepono Dariaus ir Stasio Girėno gimnazijos mokinių taryba</p>
        {hasPassword && <UnlockForm />}
        <a href="/prisijungti" className="lock-admin">Tarybai →</a>
      </div>
    </div>
  );
}
