import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type BriefEmailPaper = {
  title: string;
  url: string;
  selectionReason: string;
  summary: string;
  whyItMatters: string;
  suggestion: string;
};

export type BriefEmailDomain = {
  domainName: string;
  papers: BriefEmailPaper[];
};

const suggestionLabel: Record<string, string> = {
  read: "Read",
  flag_for_client: "Flag for client",
  skip: "Skip",
};

export default function BriefEmail({
  weekStart,
  domainGroups,
  briefUrl,
}: {
  weekStart: string;
  domainGroups: BriefEmailDomain[];
  briefUrl: string;
}) {
  const totalPapers = domainGroups.reduce((sum, d) => sum + d.papers.length, 0);

  return (
    <Html>
      <Head />
      <Preview>{`Your Research Pulse brief for the week of ${weekStart} — ${totalPapers} papers worth a look.`}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>
          <Heading as="h1" style={{ fontSize: "20px", color: "#0f172a" }}>
            Research Pulse
          </Heading>
          <Text style={{ color: "#475569", fontSize: "14px" }}>
            Week of {weekStart} &middot; {totalPapers} papers across {domainGroups.length}{" "}
            domains
          </Text>

          {domainGroups.length === 0 && (
            <Text style={{ color: "#475569" }}>
              No significant papers were found in your monitored domains this week.
            </Text>
          )}

          {domainGroups.map((domain) => (
            <Section key={domain.domainName} style={{ marginTop: "24px" }}>
              <Heading
                as="h2"
                style={{ fontSize: "16px", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "6px" }}
              >
                {domain.domainName}
              </Heading>
              {domain.papers.map((paper) => (
                <Section key={paper.url} style={{ marginTop: "14px" }}>
                  <Link href={paper.url} style={{ fontSize: "15px", fontWeight: 600, color: "#1d4ed8" }}>
                    {paper.title}
                  </Link>
                  <Text style={{ margin: "2px 0", fontSize: "12px", color: "#64748b" }}>
                    {paper.selectionReason} &middot; {suggestionLabel[paper.suggestion] ?? paper.suggestion}
                  </Text>
                  <Text style={{ margin: "4px 0", fontSize: "14px", color: "#1e293b" }}>
                    {paper.summary}
                  </Text>
                  <Text style={{ margin: "2px 0", fontSize: "13px", color: "#475569" }}>
                    <strong>Why it matters:</strong> {paper.whyItMatters}
                  </Text>
                </Section>
              ))}
            </Section>
          ))}

          <Section style={{ marginTop: "28px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
            <Text style={{ fontSize: "13px", color: "#475569" }}>
              See the full web version — including every paper scanned this week, with the
              ones filtered out and why — at{" "}
              <Link href={briefUrl} style={{ color: "#1d4ed8" }}>
                {briefUrl}
              </Link>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
