import Ransom from "@/components/Ransom";
import { SCHOOL, SCHOOL_GEN, SITE_URL, CONTACT_EMAIL } from "@/lib/site";

export const metadata = {
  title: "Privatumo politika ir slapukai",
  description: "Kaip Dariaus ir Girėno gimnazijos mokinių tarybos svetainė tvarko asmens duomenis ir kokius slapukus naudoja.",
  alternates: { canonical: "/privatumas" },
};

const UPDATED = "2026 m. lapkričio 5 d.";

export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <article className="legal">
      <div className="page-head">
        <Ransom text="Privatumas" seed={17} />
        <p className="muted">Atnaujinta {UPDATED}</p>
      </div>

      <p>
        Ši svetainė ({SITE_URL.replace("https://", "")}) yra {SCHOOL_GEN} mokinių tarybos puslapis. Čia paaiškiname paprastai,
        kokius duomenis renkame, kodėl ir kaip gali juos peržiūrėti ar ištrinti. Duomenis tvarkome pagal Bendrąjį duomenų
        apsaugos reglamentą (BDAR), Lietuvos Respublikos asmens duomenų teisinės apsaugos įstatymą ir Elektroninių ryšių įstatymą.
      </p>

      <h2>Kas atsakingas</h2>
      <p>
        {SCHOOL_GEN} mokinių taryba, Miško g. 1, LT-44321 Kaunas. Klausimams apie duomenis rašyk {mail}.
        Gali kreiptis ir į gimnazijos duomenų apsaugos pareigūną per gimnazijos administraciją.
      </p>

      <h2>Ką renkame ir kodėl</h2>
      <div className="legal-table-wrap">
        <table>
          <thead><tr><th>Kur</th><th>Kokie duomenys</th><th>Kam ir kiek laiko</th></tr></thead>
          <tbody>
            <tr><td>Idėjos</td><td>Idėjos tekstas; vardas ir klasė tik jei pats įrašai</td><td>Idėjai rodyti ir svarstyti. Vardas matomas viešai. Laikome, kol taryba idėją ištrina, arba ištriname tavo prašymu.</td></tr>
            <tr><td>Klausimai</td><td>Tik klausimo tekstas, anonimiškai</td><td>Atsakymui paskelbti. Nesaugome nei vardo, nei el. pašto.</td></tr>
            <tr><td>Balsavimas</td><td>Atsitiktinis anoniminis numeris slapuke</td><td>Kad vienas žmogus balsuotų vieną kartą. Nesiejamas su tavo vardu. Galioja 1 metus.</td></tr>
            <tr><td>Pokalbis su taryba</td><td>Žinutės; vardas tik jei pats įrašai</td><td>Atsakyti į tavo žinutę. Mato tik tarybos nariai. Ištriname po 12 mėn. nuo paskutinės žinutės, o pats gali ištrinti bet kada.</td></tr>
            <tr><td>Pranešimai</td><td>Naršyklės pranešimų adresas</td><td>Pranešimams siųsti, tik jei pats paspaudei „Gauti pranešimus“. Ištriname, kai atsisakai.</td></tr>
            <tr><td>Tarybos nariai</td><td>El. paštas, vardas, (jei jungiasi per Google) profilio nuotrauka; viešame puslapyje vardas, pareigos, klasė, nuotrauka</td><td>Prisijungti prie tarybos įrankių ir pristatyti tarybą. Viešai skelbiama tik su nario sutikimu.</td></tr>
            <tr><td>Galerija</td><td>Renginių nuotraukos</td><td>Renginiams pristatyti. Skelbiame pagal gimnazijos nustatytą tvarką ir gautus sutikimus. Pašaliname paprašius.</td></tr>
            <tr><td>Serverio žurnalai</td><td>IP adresas, naršyklė, užklausos laikas</td><td>Svetainės saugumui ir klaidoms taisyti. Laikomi trumpai (apie 1 val.).</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Teisinis pagrindas: mokinių savivaldos veikla ir teisėtas interesas (BDAR 6 str. 1 d. f p.), o vardui, nuotraukoms ir
        pranešimams tavo sutikimas (BDAR 6 str. 1 d. a p.). Sutikimą gali atšaukti bet kada. Duomenų neparduodame, nenaudojame
        reklamai ir neprofiliuojame.
      </p>

      <h2>Mokiniams iki 14 metų</h2>
      <p>
        Svetainę gali naudoti visi mokiniai. Jei tau mažiau nei 14 metų, prie idėjų ir pokalbyje nerašyk savo vardo, pavardės
        ar kitų duomenų. Gali rašyti anonimiškai. Nuotraukoms ir narių profiliams sutikimus renkame pagal gimnazijos tvarką,
        o mažesniems mokiniams sutikimą duoda tėvai ar globėjai.
      </p>

      <h2>Kas dar mato duomenis</h2>
      <ul>
        <li><strong>Vercel Inc.</strong> teikia svetainės prieglobą ir nuotraukų saugyklą (nuotraukos laikomos Frankfurte, Vokietijoje). Bendrovė įsikūrusi JAV, o duomenų perdavimą saugo ES–JAV duomenų apsaugos sistema ir standartinės sutarčių sąlygos.</li>
        <li><strong>Neon Inc.</strong> teikia duomenų bazę ir prisijungimą. Serveriai yra Frankfurte, Vokietijoje.</li>
        <li><strong>Google</strong> gauna duomenis tik jei tarybos narys pats renkasi „Prisijungti su Google“.</li>
        <li><strong>Pranešimų tarnybos</strong> (Google, Apple arba Mozilla, priklausomai nuo naršyklės) pristato pranešimus, jei juos įsijungei.</li>
        <li><strong>Instagram, TikTok, YouTube</strong> gauna duomenis tik paspaudus „▶“ prie video (žr. slapukus).</li>
      </ul>
      <p>Šriftai, nuotraukos ir visa kita svetainės dalis įkeliama iš mūsų pačių serverio, be trečiųjų šalių sekiklių ir analitikos.</p>

      <h2 id="slapukai">Slapukai</h2>
      <p>
        Naudojame tik <strong>būtinus</strong> slapukus, be kurių svetainė neveiktų taip, kaip prašai. Tam sutikimo nereikia
        (Elektroninių ryšių įstatymo 61 str.), todėl nerodome slapukų juostos. Reklamos ir analitikos slapukų nenaudojame.
      </p>
      <div className="legal-table-wrap">
        <table>
          <thead><tr><th>Slapukas</th><th>Paskirtis</th><th>Galioja</th></tr></thead>
          <tbody>
            <tr><td><code>voter</code></td><td>Anoniminis numeris, kad balsuotum vieną kartą ir matytum savo pokalbį</td><td>1 metai</td></tr>
            <tr><td>Prisijungimo sesija (Neon Auth)</td><td>Tik tarybos nariams: kad liktų prisijungę</td><td>Iki atsijungimo</td></tr>
            <tr><td><code>dg_pass</code></td><td>Tik kai svetainė užrakinta: prisimena, kad įvedei slaptažodį</td><td>30 d.</td></tr>
            <tr><td><code>dg-embeds</code> (naršyklės atmintis)</td><td>Prisimena, jei pažymėjai „Visada rodyti video“</td><td>Kol išvalysi</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>Video iš Instagram, TikTok ir YouTube</strong> neįkeliami automatiškai. Jie įsikelia tik paspaudus „▶“, ir
        tada tos platformos gali naudoti savo slapukus pagal savo taisykles. Jei pažymėjai „Visada rodyti video“, šį pasirinkimą
        gali atšaukti išvalęs šios svetainės duomenis naršyklėje.
      </p>

      <h2>Tavo teisės</h2>
      <p>Bet kada gali paprašyti:</p>
      <ul>
        <li>pasakyti, kokius duomenis apie tave turime, ir gauti jų kopiją;</li>
        <li>ištaisyti netikslius duomenis;</li>
        <li>ištrinti duomenis (pvz. idėją su tavo vardu, nuotrauką ar pokalbį);</li>
        <li>apriboti duomenų naudojimą arba nesutikti su juo;</li>
        <li>atšaukti duotą sutikimą.</li>
      </ul>
      <p>
        Rašyk {mail}. Atsakysime ne vėliau kaip per mėnesį. Pokalbį su taryba gali ištrinti ir pats, pokalbio lange
        paspaudęs „Ištrinti pokalbį“.
      </p>
      <p>
        Jei manai, kad tavo duomenys tvarkomi netinkamai, gali pateikti skundą Valstybinei duomenų apsaugos inspekcijai
        (L. Sapiegos g. 17, LT-10312 Vilnius, <a href="mailto:ada@ada.lt">ada@ada.lt</a>, <a href="https://vdai.lrv.lt" target="_blank" rel="noopener noreferrer">vdai.lrv.lt</a>).
      </p>

      <h2>Saugumas</h2>
      <p>
        Visas ryšys šifruojamas (HTTPS). Prie tarybos įrankių gali prisijungti tik patvirtintą el. paštą turintys nariai,
        kuriems savininkas suteikė teises. Kiekvienas narys mato tik tas dalis, kurioms turi teisę.
      </p>

      <h2>Pakeitimai</h2>
      <p>Jei ši politika keisis, atnaujinsime datą šio puslapio viršuje.</p>
    </article>
  );
}
