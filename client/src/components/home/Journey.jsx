import React, { useEffect, useState } from 'react';

const JOURNEY_THEME = {
  containerBorder: 'border-[var(--ngo-border)]',
  headerGradient: 'from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]',
  countBadge: 'bg-white/20 text-white',
  dot: 'bg-[var(--ngo-primary)]'
};

const getThemeByIndex = () => JOURNEY_THEME;

const normalizeMilestones = (journey) =>
  Array.isArray(journey?.milestones)
    ? journey.milestones.map((milestone) => String(milestone || '').trim()).filter(Boolean)
    : [];

const getJourneySummary = (journey, milestones) => {
  const explicitSummary = String(journey?.summary || '').trim();
  if (explicitSummary) return explicitSummary;

  const fallback = milestones[0] || 'Milestones for this year are being updated.';
  return fallback.length > 170 ? `${fallback.slice(0, 170)}...` : fallback;
};

const JourneyCard = ({
  journey,
  theme,
  cardId,
  compact = false,
  expanded = false,
  suppressHover = false,
  onToggle,
  onClearSuppress
}) => {
  const milestones = normalizeMilestones(journey);
  const summary = getJourneySummary(journey, milestones);

  let detailPanelClass = 'max-h-0 opacity-0';
  if (expanded) {
    detailPanelClass = 'mt-3 max-h-72 opacity-100';
  } else if (!suppressHover) {
    detailPanelClass =
      'max-h-0 opacity-0 lg:group-hover:mt-3 lg:group-hover:max-h-72 lg:group-hover:opacity-100 lg:group-focus-within:mt-3 lg:group-focus-within:max-h-72 lg:group-focus-within:opacity-100';
  }

  return (
    <article
      data-journey-card="true"
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onMouseLeave={() => onClearSuppress?.(cardId)}
      onClick={() => onToggle(cardId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onToggle(cardId);
        }
      }}
      className={`group relative cursor-pointer border bg-white shadow-sm ${
        compact ? 'rounded-[3rem] p-3' : 'rounded-[3.4rem] p-4'
      } ${theme.containerBorder}`}
    >
      <div className="pointer-events-none absolute -right-[clamp(0.9rem,2vw,1.8rem)] -top-[clamp(0.9rem,2vw,1.8rem)] h-[clamp(3.5rem,10vw,6rem)] w-[clamp(3.5rem,10vw,6rem)] rounded-full bg-slate-100/75" />
      <div className="pointer-events-none absolute -bottom-[clamp(1.1rem,2.6vw,2.2rem)] -left-[clamp(1.1rem,2.6vw,2.2rem)] h-[clamp(4.5rem,13vw,7.5rem)] w-[clamp(4.5rem,13vw,7.5rem)] rounded-full bg-slate-50" />

      <div className="relative z-10">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${theme.headerGradient} ${compact ? 'px-3 py-1.5' : 'px-3.5 py-1.5'}`}>
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-bold text-white`}>
              {journey?.year || 'Year'}
            </h3>
            <span
              className={`rounded-full font-semibold ${theme.countBadge} ${
                compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'
              }`}
            >
              {milestones.length}
            </span>
          </div>
        </div>

        <p className={`${compact ? 'text-xs leading-5' : 'text-sm leading-6'} text-slate-700`}>
          {summary}
        </p>

        <div className={`overflow-hidden transition-all duration-300 ${detailPanelClass}`}>
          {milestones.length > 0 ? (
            <ul className="rounded-[1.8rem] border border-slate-100 bg-slate-50/60 p-2.5">
              {milestones.map((milestone, milestoneIndex) => (
                <li
                  key={milestoneIndex}
                  className={`flex gap-2.5 ${compact ? 'py-1.5' : 'py-2'} ${
                    milestoneIndex < milestones.length - 1 ? 'border-b border-slate-200/70' : ''
                  }`}
                >
                  <span className="mt-[3px] text-[10px] font-semibold text-slate-400">
                    {String(milestoneIndex + 1).padStart(2, '0')}
                  </span>
                  <span className={`mt-[8px] h-2 w-2 shrink-0 rounded-full ${theme.dot}`} />
                  <p className={`${compact ? 'text-xs leading-5' : 'text-sm leading-6'} text-slate-700`}>
                    {milestone}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-[var(--ngo-border)] bg-slate-50 px-3 py-2 text-xs text-slate-700">
              Milestones are being updated for this year.
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const Journey = ({ loading = false, journeys = [] }) => {
  const [expandedCardId, setExpandedCardId] = useState('');
  const [hoverSuppressedCardId, setHoverSuppressedCardId] = useState('');

  const handleToggleCard = (cardId) => {
    const isClosingActiveCard = expandedCardId === cardId;
    if (isClosingActiveCard) {
      setExpandedCardId('');
      setHoverSuppressedCardId(cardId);
      return;
    }
    setExpandedCardId(cardId);
    setHoverSuppressedCardId('');
  };

  const clearSuppressedHover = (cardId) => {
    setHoverSuppressedCardId((prev) => (prev === cardId ? '' : prev));
  };

  useEffect(() => {
    if (!expandedCardId) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-journey-card="true"]')) {
        return;
      }
      setExpandedCardId('');
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setExpandedCardId('');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [expandedCardId]);

  return (
    <div className="mt-16">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
        <h2 className="text-3xl font-bold text-center text-white md:text-left">Our Journey</h2>
        <p className="mt-2 text-sm text-center text-white/90 md:text-left">
          Milestones that shaped our growth and community impact over the years.
        </p>
      </div>

      {loading ? (
        <div className="text-center">Loading journey...</div>
      ) : journeys.length > 0 ? (
        <>
          <div className="relative mx-auto max-w-6xl lg:hidden">
            <div className="max-h-[min(70vh,34rem)] overflow-y-auto pr-1 no-scrollbar">
              <div className="relative px-1">
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-slate-300 via-blue-300 to-slate-300" />

                <div className="space-y-6">
                  {journeys.map((journey, index) => {
                    const isLeft = index % 2 === 0;
                    const theme = getThemeByIndex(index);
                    const cardId = String(journey?._id || `${journey?.year || 'year'}-${index}`);

                    return (
                      <div
                        key={cardId}
                        className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-3"
                      >
                        {isLeft ? (
                          <div className="relative z-20 col-start-1">
                            <JourneyCard
                              journey={journey}
                              theme={theme}
                              compact
                              cardId={cardId}
                              expanded={expandedCardId === cardId}
                              suppressHover={hoverSuppressedCardId === cardId}
                              onToggle={handleToggleCard}
                              onClearSuppress={clearSuppressedHover}
                            />
                          </div>
                        ) : (
                          <div className="col-start-1" />
                        )}

                        <div className="relative z-10 col-start-2 flex items-start justify-center pt-7">
                          <span className={`h-4 w-4 rounded-full border-4 border-white shadow ${theme.dot}`} />
                          <span
                            className={`absolute top-[2.05rem] h-px w-6 bg-slate-300 ${
                              isLeft ? '-left-6' : 'left-6'
                            }`}
                          />
                        </div>

                        {isLeft ? (
                          <div className="col-start-3" />
                        ) : (
                          <div className="relative z-20 col-start-3">
                            <JourneyCard
                              journey={journey}
                              theme={theme}
                              compact
                              cardId={cardId}
                              expanded={expandedCardId === cardId}
                              suppressHover={hoverSuppressedCardId === cardId}
                              onToggle={handleToggleCard}
                              onClearSuppress={clearSuppressedHover}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative overflow-x-auto pb-2">
              <div className="relative mx-auto flex min-w-max items-stretch gap-[clamp(1rem,2.4vw,2.25rem)] px-[clamp(0.75rem,2vw,1.75rem)] py-[clamp(1rem,2vw,2rem)]">
                <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-slate-300 via-blue-300 to-slate-300" />

                {journeys.map((journey, index) => {
                  const isTop = index % 2 === 0;
                  const theme = getThemeByIndex(index);
                  const cardId = String(journey?._id || `${journey?.year || 'year'}-${index}`);

                  return (
                    <div
                      key={cardId}
                      className={`relative flex h-[clamp(24rem,38vw,32rem)] w-[clamp(14rem,20vw,18rem)] flex-col ${isTop ? 'justify-start' : 'justify-end'}`}
                    >
                      <span
                        className={`pointer-events-none absolute left-1/2 top-1/2 z-10 w-px -translate-x-1/2 bg-slate-300 ${
                          isTop ? 'h-[clamp(2.25rem,4vw,3.25rem)] -translate-y-full' : 'h-[clamp(2.25rem,4vw,3.25rem)]'
                        }`}
                      />
                      <div className={`relative z-20 ${isTop ? 'mb-[clamp(2.25rem,4vw,3.25rem)]' : 'mt-[clamp(2.25rem,4vw,3.25rem)]'}`}>
                        <JourneyCard
                          journey={journey}
                          theme={theme}
                          cardId={cardId}
                          expanded={expandedCardId === cardId}
                          suppressHover={hoverSuppressedCardId === cardId}
                          onToggle={handleToggleCard}
                          onClearSuppress={clearSuppressedHover}
                        />
                      </div>

                      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                        <span className={`block h-4 w-4 rounded-full border-4 border-white shadow ${theme.dot}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-8 text-center text-gray-500">
          No journey data available yet.
        </div>
      )}
    </div>
  );
};

export default Journey;
