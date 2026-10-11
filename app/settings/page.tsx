import { isAuthenticated } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { domains, settings } from "@/lib/db/schema";
import LoginForm from "./LoginForm";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Settings login</h1>
        <LoginForm />
      </div>
    );
  }

  const domainRows = await db.select().from(domains).orderBy(domains.id);
  const settingRows = await db.select().from(settings);
  const recipientEmail =
    settingRows.find((s) => s.key === "recipient_email")?.value ?? "";

  return <SettingsClient initialDomains={domainRows} initialRecipientEmail={recipientEmail} />;
}
