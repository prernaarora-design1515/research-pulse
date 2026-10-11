import { db } from "@/lib/db/client";
import { domains, settings } from "@/lib/db/schema";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const domainRows = await db.select().from(domains).orderBy(domains.id);
  const settingRows = await db.select().from(settings);
  const recipientEmail =
    settingRows.find((s) => s.key === "recipient_email")?.value ?? "";

  return <SettingsClient initialDomains={domainRows} initialRecipientEmail={recipientEmail} />;
}
