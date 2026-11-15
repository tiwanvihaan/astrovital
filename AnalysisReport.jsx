import React from 'react';

const Section = ({ label, children }) => (
  <div className="border-b border-hairline/50 py-3 first:pt-0 last:border-0 last:pb-0">
    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-brand-cyan">{label}</p>
    <div className="mt-1.5 space-y-1.5">{children}</div>
  </div>
);

const Bullets = ({ items, empty }) =>
  items?.length ? (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-[11.5px] leading-relaxed text-muted-foreground">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-[11.5px] text-muted-foreground/70">{empty}</p>
  );

const Narrative = ({ section, empty }) =>
  section?.summary || section?.observations?.length ? (
    <div className="space-y-1.5">
      {section.summary && <p className="text-[11.5px] leading-relaxed text-foreground/90">{section.summary}</p>}
      <Bullets items={section.observations} empty={empty} />
    </div>
  ) : (
    <p className="text-[11.5px] text-muted-foreground/70">{empty}</p>
  );

export default function AnalysisReport({ report }) {
  if (!report) return null;

  return (
    <div className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">AI health analysis</p>
          <h2 className="mt-1 text-[15px]">Your report</h2>
        </div>
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {report.model || 'AstroVital AI'} · AI-generated
        </p>
      </div>

      <div className="mt-4">
        <Section label="A · What's going well">
          <Bullets items={report.going_well} empty="No positive indicators were identified from the available records." />
        </Section>

        <Section label="B · Areas to monitor">
          <Bullets items={report.monitor} empty="Nothing unusual stands out in the records provided." />
        </Section>

        <Section label="C · Movement">
          <Narrative section={report.movement} empty="No movement data was available to analyse." />
        </Section>

        <Section label="D · Mobility">
          <Narrative section={report.mobility} empty="No mobility assessment was available to analyse." />
        </Section>

        <Section label="E · Recovery">
          <Narrative section={report.recovery} empty="No recovery or sleep records were available to analyse." />
        </Section>

        <Section label="F · NASA research comparison">
          {report.research?.length ? (
            <div className="space-y-2">
              {report.research.map((item) => (
                <div key={item.accession} className="rounded-2xl border border-hairline/70 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-brand-cyan">{item.accession}</span>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground hover:text-brand-cyan">
                      NASA OSDR
                    </a>
                  </div>
                  <p className="mt-1 text-[11.5px] font-medium leading-snug text-foreground">{item.title}</p>
                  {item.finding && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.finding}</p>}
                  {item.why_it_matters && (
                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">
                      <span className="text-muted-foreground">Why it matters: </span>
                      {item.why_it_matters}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11.5px] text-muted-foreground/70">
              No NASA OSDR studies were retrieved for this analysis. Nothing has been invented to fill the gap.
            </p>
          )}
        </Section>

        <Section label="G · Recommendations">
          {report.recommendations?.length ? (
            <div className="space-y-1.5">
              {report.recommendations.map((item, index) => (
                <div key={index} className="flex gap-2 text-[11.5px] leading-relaxed">
                  <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                    {item.area}
                  </span>
                  <span className="text-muted-foreground">{item.action}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11.5px] text-muted-foreground/70">No recommendations were generated.</p>
          )}
        </Section>

        <Section label="H · Overall summary">
          <p className="text-[11.5px] leading-relaxed text-foreground/90">{report.summary_note || '—'}</p>
          {report.data_gaps?.length > 0 && (
            <div className="mt-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Missing information</p>
              <Bullets items={report.data_gaps} empty="" />
            </div>
          )}
        </Section>
      </div>

      <p className="mt-4 border-t border-hairline/60 pt-3 text-[10px] leading-relaxed text-muted-foreground/80">
        This report is AI-generated from your own records and what you submitted. It is not a medical diagnosis. Personal
        measurements, published NASA research and AI interpretation are labelled separately above; nothing here is a
        substitute for your crew medical officer or flight surgeon.
      </p>
    </div>
  );
}