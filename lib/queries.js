import { sql } from "./db";

export async function getIdeas(voter, { limit = 100 } = {}) {
  return sql`
    SELECT i.id, i.title, i.body, i.author, i.status, i.created_at,
           count(v.voter)::int AS votes,
           coalesce(bool_or(v.voter = ${voter ?? ""}), false) AS voted
    FROM ideas i LEFT JOIN idea_votes v ON v.idea_id = i.id
    WHERE i.status <> 'pending'
    GROUP BY i.id
    ORDER BY (i.status = 'done'), votes DESC, i.created_at DESC
    LIMIT ${limit}`;
}

export async function getPolls(voter, { activeOnly = false } = {}) {
  const polls = await sql`
    SELECT id, question, active FROM polls
    WHERE ${!activeOnly} OR active
    ORDER BY active DESC, created_at DESC`;
  if (polls.length === 0) return [];

  const ids = polls.map((p) => p.id);
  const options = await sql`
    SELECT o.id, o.poll_id, o.label, count(v.voter)::int AS votes
    FROM poll_options o LEFT JOIN poll_votes v ON v.option_id = o.id
    WHERE o.poll_id = ANY(${ids})
    GROUP BY o.id ORDER BY o.id`;
  const mine = voter
    ? await sql`SELECT poll_id, option_id FROM poll_votes WHERE voter = ${voter} AND poll_id = ANY(${ids})`
    : [];

  return polls.map((p) => ({
    ...p,
    options: options.filter((o) => o.poll_id === p.id),
    myOption: mine.find((m) => m.poll_id === p.id)?.option_id ?? null,
  }));
}

export async function getUpcomingEvents(limit = 50) {
  return sql`
    SELECT * FROM events
    WHERE starts_at > now() - interval '6 hours'
    ORDER BY starts_at LIMIT ${limit}`;
}

export async function getAnsweredQuestions() {
  return sql`SELECT * FROM questions WHERE answer IS NOT NULL ORDER BY answered_at DESC LIMIT 100`;
}

export async function getStats() {
  const [row] = await sql`
    SELECT
      (SELECT count(*)::int FROM ideas WHERE status <> 'pending') AS ideas,
      (SELECT count(*)::int FROM ideas WHERE status = 'done') AS done,
      (SELECT count(*)::int FROM polls WHERE active) AS polls,
      (SELECT count(*)::int FROM events WHERE starts_at > now() - interval '6 hours') AS events,
      (SELECT count(*)::int FROM questions WHERE answer IS NOT NULL) AS answered,
      (SELECT count(*)::int FROM idea_votes) + (SELECT count(*)::int FROM poll_votes) AS votes`;
  return row;
}

export async function getBlocks({ includeHidden = false } = {}) {
  return sql`
    SELECT * FROM blocks
    WHERE ${includeHidden} OR visible
    ORDER BY place, position, id`;
}
