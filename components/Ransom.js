// „Iškarpų" antraštė: kiekviena raidė ant skirtingo popieriaus lapelio.
const PAPERS = [
  { bg: "var(--mustard)", fg: "var(--wine)" },
  { bg: "var(--wine)", fg: "var(--mustard)" },
  { bg: "var(--rose)", fg: "var(--wine)" },
  { bg: "var(--blush)", fg: "var(--wine)" },
  { bg: "var(--orange)", fg: "var(--cream)" },
  { bg: "var(--cream)", fg: "var(--rose-deep)" },
  { bg: "var(--mustard)", fg: "var(--cream)" },
  { bg: "var(--wine)", fg: "var(--blush)" },
];
const FONTS = ["var(--f-shrikhand)", "var(--f-abril)", "var(--f-playfair)", "var(--f-bricolage)", "var(--f-rubik)"];
const TORN = [
  "polygon(2% 4%, 30% 0%, 62% 5%, 98% 1%, 100% 40%, 96% 72%, 99% 97%, 60% 100%, 28% 95%, 0% 99%, 3% 60%, 0% 28%)",
  "polygon(0% 2%, 45% 6%, 100% 0%, 97% 35%, 100% 100%, 55% 94%, 4% 100%, 0% 55%)",
  "polygon(5% 0%, 100% 6%, 94% 50%, 100% 95%, 40% 100%, 0% 92%, 4% 45%)",
  "polygon(0% 0%, 70% 3%, 97% 0%, 100% 62%, 95% 100%, 20% 96%, 2% 100%, 0% 38%)",
];

// Deterministinis „atsitiktinumas", kad serveris ir naršyklė sutaptų
const pick = (arr, n) => arr[Math.abs(n) % arr.length];

export default function Ransom({ text, as: Tag = "h1", seed = 0, className = "" }) {
  const words = text.split(" ");
  let k = seed;
  return (
    <Tag className={`ransom ${className}`} aria-label={text}>
      {words.map((word, wi) => (
        <span className="ransom-word" key={wi} aria-hidden>
          {[...word].map((ch, ci) => {
            k += 1;
            const h = k * 7 + ch.charCodeAt(0);
            const paper = pick(PAPERS, h);
            const isEmoji = /\p{Extended_Pictographic}/u.test(ch);
            if (isEmoji) return <span key={ci} className="ransom-emoji">{ch}</span>;
            return (
              <span
                key={ci}
                className="ransom-letter"
                style={{
                  background: paper.bg,
                  color: paper.fg,
                  fontFamily: pick(FONTS, h * 3 + 1),
                  fontWeight: /shrikhand|abril/.test(pick(FONTS, h * 3 + 1)) ? 400 : 800,
                  fontStyle: h % 3 === 0 ? "italic" : "normal",
                  textTransform: h % 4 === 0 ? "uppercase" : "none",
                  clipPath: pick(TORN, h * 5),
                  transform: `rotate(${(h % 11) - 5}deg) translateY(${(h % 5) - 2}px)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
