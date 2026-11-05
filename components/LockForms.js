"use client";

import { useActionState } from "react";
import { unlockSite, saveLockSettings } from "@/app/lock-actions";
import { SubmitButton, Feedback } from "./Forms";

export function UnlockForm() {
  const [state, action] = useActionState(unlockSite, null);
  return (
    <form action={action} className="card form lock-form">
      <h3>Turi slaptažodį?</h3>
      <label className="field"><span>Slaptažodis</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <SubmitButton pendingText="Tikrinama…">Įeiti</SubmitButton>
      <Feedback state={state} />
    </form>
  );
}

// Admin: užrakinimo nustatymai

export function LockSettingsForm({ lock }) {
  const [state, action] = useActionState(saveLockSettings, null);
  return (
    <form action={action} className="card form" id="uzrakinimas">
      <label className="switch">
        <input type="checkbox" name="enabled" value="1" defaultChecked={lock.enabled} />
        <span><strong>Užrakinti svetainę</strong><small className="muted">Lankytojai matys tik pranešimą žemiau</small></span>
      </label>
      <label className="field"><span>Antraštė</span><input name="title" maxLength={120} defaultValue={lock.title} /></label>
      <label className="field"><span>Pranešimas</span><textarea name="message" rows={4} maxLength={1500} defaultValue={lock.message} /></label>
      <label className="field"><span>Kada baigsis (nebūtina)</span><input name="eta" maxLength={120} defaultValue={lock.eta} placeholder="Darbai užtruks apie 2 valandas" /></label>
      <label className="field"><span>{lock.hash ? "Naujas slaptažodis (palik tuščią, jei nekeiti)" : "Slaptažodis lankytojams (nebūtina)"}</span>
        <input name="password" type="text" autoComplete="off" maxLength={100} placeholder={lock.hash ? "••••••" : "Pvz. dg2026"} />
      </label>
      {lock.hash && (
        <label className="check"><input type="checkbox" name="remove_password" value="1" /> Pašalinti slaptažodį (įeiti galės tik taryba)</label>
      )}
      <small className="muted">Su slaptažodžiu įėjęs žmogus matys svetainę 30 dienų arba kol pakeisi slaptažodį. Tarybos nariai su teisėmis mato visada.</small>
      <SubmitButton pendingText="Saugoma…">Išsaugoti</SubmitButton>
      <Feedback state={state} />
    </form>
  );
}
