import React, { useEffect, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import StudyCard from '@/components/research/StudyCard';
import StudyDialog from '@/components/research/StudyDialog';
import { RESEARCH_CATEGORIES, loadResearchCategories, searchResearch } from '@/lib/research';

export default function NasaResearchPanel() {
  const [rails, setRails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [active, setActive] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    loadResearchCategories()
      .then((rows) => alive && setRails(rows))
      .catch((error) => alive && setLoadError(error.message || 'NASA research could not be reached.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const runSearch = async (event) => {
    event?.preventDefault();
    const term = query.trim();
    if (!term) {
      setResults(null);
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const data = await searchResearch(term);
      setResults(data);
    } catch (error) {
      setSearchError(error.message || 'NASA OSDR search failed.');
      setResults(null);
    } finally {
      setSearching(false);
    }
  };

  const visibleRails = (rails || []).filter((rail) => active === 'all' || rail.key === active);
  const allStudies = (rails || []).flatMap((rail) => rail.studies || []);
  const featured = [...allStudies].sort((a, b) => String(b.released).localeCompare(String(a.released)))[0];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-hairline bg-surface/70 p-5 shadow-panel sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Scientific grounding</p>
            <h2 className="mt-1 text-[16px]">NASA research</h2>
            <p className="mt-1 max-w-xl text-[11.5px] leading-relaxed text-muted-foreground">
              Every study below is retrieved live from NASA's Open Science Data Repository. Links open the original
              record on osdr.nasa.gov — nothing here is generated or invented.
            </p>
          </div>
          <a href="https://osdr.nasa.gov/bio/repo/" target="_blank" rel="noreferrer" className="text-[10.5px] text-muted-foreground hover:text-brand-cyan">
            Open OSDR repository
          </a>
        </div>

        <form onSubmit={runSearch} className="mt-4 flex items-center gap-2 rounded-xl border border-hairline bg-white/[0.03] px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search NASA space biology research — bone, sleep, radiation…"
            className="flex-1 bg-transparent py-1.5 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          {results && (
            <button type="button" onClick={() => { setResults(null); setQuery(''); }} aria-label="Clear search" className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button type="submit" disabled={searching} className="rounded-lg bg-brand-cyan px-2.5 py-1 text-[10.5px] font-medium text-primary-foreground disabled:opacity-50">
            {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Search'}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActive('all')}
            className={`rounded-full border px-2.5 py-1 text-[10.5px] transition-colors ${
              active === 'all' ? 'border-brand-cyan/50 bg-brand-cyan/10 text-foreground' : 'border-hairline text-muted-foreground hover:text-foreground'
            }`}
          >
            All topics
          </button>
          {RESEARCH_CATEGORIES.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActive(category.key)}
              className={`rounded-full border px-2.5 py-1 text-[10.5px] transition-colors ${
                active === category.key ? 'border-brand-cyan/50 bg-brand-cyan/10 text-foreground' : 'border-hairline text-muted-foreground hover:text-foreground'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {searchError && <p className="rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-3 py-2 text-[11.5px] text-brand-rose">{searchError}</p>}
      {loadError && <p className="rounded-xl border border-brand-rose/30 bg-brand-rose/10 px-3 py-2 text-[11.5px] text-brand-rose">{loadError}</p>}

      {results ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <h3 className="text-[13px]">Results for “{results.term}”</h3>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{results.total} OSDR records</p>
          </div>
          {results.studies?.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {results.studies.map((study) => (
                <StudyCard key={study.accession} study={study} onOpen={setSelected} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-hairline px-4 py-6 text-center text-[11.5px] text-muted-foreground">
              No NASA OSDR studies matched that search.
            </p>
          )}
        </section>
      ) : loading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl border border-hairline bg-surface/40" />
          ))}
        </div>
      ) : (
        <>
          {featured && active === 'all' && (
            <section className="rounded-3xl border border-brand-cyan/25 bg-brand-cyan/[0.05] p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-brand-cyan">Featured study</p>
              <h3 className="mt-1.5 text-[14px] leading-snug">{featured.title}</h3>
              <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">{featured.description}</p>
              <button
                type="button"
                onClick={() => setSelected(featured)}
                className="mt-2.5 rounded-full border border-hairline px-3 py-1 text-[10.5px] text-muted-foreground hover:border-brand-cyan/40 hover:text-foreground"
              >
                Read {featured.accession}
              </button>
            </section>
          )}

          {visibleRails.map((rail) => (
            <section key={rail.key} className="space-y-2">
              <div className="flex items-end justify-between gap-2">
                <h3 className="text-[12.5px] uppercase tracking-[0.1em] text-foreground">{rail.label}</h3>
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{rail.total} records</p>
              </div>
              {rail.studies?.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {rail.studies.map((study) => (
                    <StudyCard key={`${rail.key}-${study.accession}`} study={study} onOpen={setSelected} compact />
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground/70">No records returned for this topic right now.</p>
              )}
            </section>
          ))}
        </>
      )}

      {selected && <StudyDialog study={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}