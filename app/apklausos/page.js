import Ransom from "@/components/Ransom";
import { getVoter } from "@/lib/session";
import { getPolls } from "@/lib/queries";
import PollCard from "@/components/PollCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Apklausos" };

export default async function PollsPage() {
  const polls = await getPolls(await getVoter());

  return (
    <>
      <div className="page-head">
        <Ransom text="Apklausos" seed={21} />
        <p className="muted">Vienas žmogus, vienas balsas. Prabalsavęs iškart pamatysi rezultatus.</p>
      </div>

      {polls.length === 0 ? (
        <div className="card empty"><span className="big">🗳️</span>Šiuo metu apklausų nėra</div>
      ) : (
        <div className="poll-grid">
          {polls.map((p) => <PollCard key={p.id} poll={p} />)}
        </div>
      )}
    </>
  );
}
