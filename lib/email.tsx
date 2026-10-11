import { Resend } from "resend";
import { render } from "@react-email/components";
import { eq, and } from "drizzle-orm";
import { db } from "./db/client";
import { briefs, briefItems, papers, domains, settings } from "./db/schema";
import BriefEmail, { type BriefEmailDomain } from "./emailTemplate";

async function loadBriefForEmail(briefId: number): Promise<{
  weekStart: string;
  domainGroups: BriefEmailDomain[];
} | null> {
  const [brief] = await db.select().from(briefs).where(eq(briefs.id, briefId));
  if (!brief) return null;

  const rows = await db
    .select({
      domainId: domains.id,
      domainName: domains.name,
      title: papers.title,
      url: papers.url,
      selectionReason: briefItems.selectionReason,
      summary: briefItems.summary,
      whyItMatters: briefItems.whyItMatters,
      suggestion: briefItems.suggestion,
    })
    .from(briefItems)
    .innerJoin(papers, eq(briefItems.paperId, papers.id))
    .innerJoin(domains, eq(briefItems.domainId, domains.id))
    .where(and(eq(briefItems.briefId, briefId), eq(briefItems.isSelected, true)))
    .orderBy(domains.id);

  const grouped = new Map<number, BriefEmailDomain>();
  for (const r of rows) {
    if (!grouped.has(r.domainId)) {
      grouped.set(r.domainId, { domainName: r.domainName, papers: [] });
    }
    grouped.get(r.domainId)!.papers.push({
      title: r.title,
      url: r.url,
      selectionReason: r.selectionReason,
      summary: r.summary,
      whyItMatters: r.whyItMatters,
      suggestion: r.suggestion,
    });
  }

  return { weekStart: brief.weekStart, domainGroups: Array.from(grouped.values()) };
}

export async function sendBriefEmail(briefId: number): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;
  if (!apiKey || !from || !appUrl) {
    throw new Error("RESEND_API_KEY, EMAIL_FROM, and APP_URL must be set to send email");
  }

  const [recipientSetting] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "recipient_email"));
  const recipient = recipientSetting?.value;
  if (!recipient) {
    throw new Error("No recipient_email configured in settings");
  }

  const data = await loadBriefForEmail(briefId);
  if (!data) throw new Error(`Brief ${briefId} not found`);

  const briefUrl = `${appUrl}/archive/${briefId}`;
  const html = await render(
    <BriefEmail weekStart={data.weekStart} domainGroups={data.domainGroups} briefUrl={briefUrl} />
  );

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: recipient,
    subject: `Research Pulse — week of ${data.weekStart}`,
    html,
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }
}
