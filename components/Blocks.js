import Ransom from "./Ransom";
import { SubmitButton, ConfirmButton } from "./Forms";
import { moveBlock, toggleBlock, deleteBlock } from "@/app/actions";
import { KINDS, isExternal } from "@/lib/blocks";

function ext(url) {
  return isExternal(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function Block({ b }) {
  switch (b.kind) {
    case "button":
      return (
        <a href={b.url} className={`block-button c-${b.color}`} {...ext(b.url)}>
          {b.title}{isExternal(b.url) && <span className="ext" aria-hidden>↗</span>}
        </a>
      );
    case "banner": {
      const inner = <><span className="banner-text">{b.title}</span>{b.url && <span className="banner-go">Plačiau →</span>}</>;
      return b.url
        ? <a href={b.url} className={`block-banner c-${b.color}`} {...ext(b.url)}>{inner}</a>
        : <div className={`block-banner c-${b.color}`}>{inner}</div>;
    }
    case "heading":
      return <Ransom text={b.title} as="h2" className="sm block-heading" seed={b.id * 13} />;
    case "text":
      return (
        <div className="card block-text">
          {b.title && <h3>{b.title}</h3>}
          <p>{b.body}</p>
        </div>
      );
    case "image":
      return (
        <figure className="block-image">
          <img src={b.url} alt={b.title || ""} loading="lazy" />
          {b.title && <figcaption>{b.title}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}

// Gretimus mygtukus sudedam į vieną eilę
function group(blocks) {
  const out = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (b.kind === "button" && Array.isArray(last)) last.push(b);
    else out.push(b.kind === "button" ? [b] : b);
  }
  return out;
}

function IdForm({ action, id, children, extra }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {extra}
      {children}
    </form>
  );
}

export default function Blocks({ blocks, editable = false, editingId = null }) {
  if (!blocks?.length) return null;

  if (!editable) {
    return (
      <div className="blocks">
        {group(blocks).map((g) =>
          Array.isArray(g) ? (
            <div key={`row-${g[0].id}`} className="block-buttons">{g.map((b) => <Block key={b.id} b={b} />)}</div>
          ) : (
            <Block key={g.id} b={g} />
          )
        )}
      </div>
    );
  }

  return (
    <div className="blocks">
      {blocks.map((b, i) => (
        <div key={b.id} className={`block-edit ${b.visible ? "" : "is-hidden"} ${editingId === b.id ? "is-editing" : ""}`}>
          <div className="block-toolbar">
            <span className="block-kind">{KINDS[b.kind]?.emoji} {KINDS[b.kind]?.label}</span>
            {!b.visible && <span className="tag">Paslėpta</span>}
            <span className="spacer" />
            <IdForm action={moveBlock} id={b.id} extra={<input type="hidden" name="dir" value="up" />}>
              <SubmitButton className="icon-btn" pendingText="…" disabled={i === 0} title="Aukštyn">↑</SubmitButton>
            </IdForm>
            <IdForm action={moveBlock} id={b.id} extra={<input type="hidden" name="dir" value="down" />}>
              <SubmitButton className="icon-btn" pendingText="…" disabled={i === blocks.length - 1} title="Žemyn">↓</SubmitButton>
            </IdForm>
            <a href={`/admin/puslapis?edit=${b.id}#forma`} className="icon-btn" title="Redaguoti">✎</a>
            <IdForm action={toggleBlock} id={b.id}>
              <SubmitButton className="icon-btn" pendingText="…" title={b.visible ? "Paslėpti" : "Rodyti"}>{b.visible ? "👁" : "🙈"}</SubmitButton>
            </IdForm>
            <IdForm action={deleteBlock} id={b.id}>
              <ConfirmButton className="icon-btn danger" message="Ištrinti šį bloką?" title="Ištrinti">🗑</ConfirmButton>
            </IdForm>
          </div>
          <Block b={b} />
        </div>
      ))}
    </div>
  );
}
