import React, { useEffect, useState } from 'react';
import Loader from '../../components/Loader';
import { getGovernance } from '../../utils/api';

const getInitials = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

const countHierarchyMembers = (nodes = []) =>
  nodes.reduce(
    (total, node) =>
      total +
      1 +
      countHierarchyMembers(Array.isArray(node?.children) ? node.children : []),
    0
  );

const DEFAULT_POLICY_TIER_TITLES = [
  'Governing Board',
  'Advisory Council',
  'Executive Board',
  'Departments & Divisions'
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toSafeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeOrgChart = (orgChart) => {
  const source = orgChart && typeof orgChart === 'object' ? orgChart : {};
  const width = clamp(Math.round(toSafeNumber(source.width, 1400)), 900, 3000);
  const height = clamp(Math.round(toSafeNumber(source.height, 900)), 600, 2400);

  const groups = Array.isArray(source.groups)
    ? source.groups.map((group, index) => ({
      id: String(group?.id || `group-${index}`),
      name: String(group?.name || '').trim(),
      color: String(group?.color || '#dbeafe').trim() || '#dbeafe',
      x: clamp(Math.round(toSafeNumber(group?.x, 40)), 0, width - 100),
      y: clamp(Math.round(toSafeNumber(group?.y, 40)), 0, height - 80),
      width: clamp(Math.round(toSafeNumber(group?.width, 360)), 200, width),
      height: clamp(Math.round(toSafeNumber(group?.height, 220)), 140, height)
    }))
    : [];

  const nodes = Array.isArray(source.nodes)
    ? source.nodes.map((node, index) => ({
      id: String(node?.id || `node-${index}`),
      name: String(node?.name || '').trim(),
      position: String(node?.position || '').trim(),
      experience: String(node?.experience || '').trim(),
      image: String(node?.image || '').trim(),
      x: clamp(Math.round(toSafeNumber(node?.x, 80)), 0, width - 220),
      y: clamp(Math.round(toSafeNumber(node?.y, 80)), 0, height - 110)
    }))
      .filter((node) => node.name || node.position || node.experience || node.image)
    : [];

  const nodeIdSet = new Set(nodes.map((node) => node.id));

  const edges = Array.isArray(source.edges)
    ? source.edges
      .map((edge, index) => ({
        id: String(edge?.id || `edge-${index}`),
        source: String(edge?.source || ''),
        target: String(edge?.target || ''),
        relation: ['reports_to', 'advises', 'dotted_line', 'supports'].includes(edge?.relation)
          ? edge.relation
          : 'reports_to',
        label: String(edge?.label || '').trim()
      }))
      .filter((edge) => edge.source && edge.target && edge.source !== edge.target)
      .filter((edge) => nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target))
    : [];

  return {
    enabled: source.enabled === true || source.enabled === 'true',
    width,
    height,
    groups,
    nodes,
    edges
  };
};

const relationStroke = (relation) => {
  if (relation === 'dotted_line') {
    return { color: '#64748b', dash: '6 6' };
  }
  if (relation === 'advises') {
    return { color: '#0284c7', dash: '10 6' };
  }
  if (relation === 'supports') {
    return { color: '#059669', dash: 'none' };
  }
  return { color: '#1d4ed8', dash: 'none' };
};

const GovernanceOrgChart = ({ orgChart }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
    <div className="overflow-auto">
      <div
        className="relative"
        style={{
          width: orgChart.width,
          height: orgChart.height,
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          <defs>
            <marker
              id="governance-orgchart-arrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
            </marker>
          </defs>

          {orgChart.edges.map((edge) => {
            const source = orgChart.nodes.find((node) => node.id === edge.source);
            const target = orgChart.nodes.find((node) => node.id === edge.target);
            if (!source || !target) return null;

            const fromX = source.x + 110;
            const fromY = source.y + 55;
            const toX = target.x + 110;
            const toY = target.y + 55;
            const middleX = (fromX + toX) / 2;
            const middleY = (fromY + toY) / 2;
            const stroke = relationStroke(edge.relation);

            return (
              <g key={edge.id}>
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={stroke.color}
                  strokeWidth="2"
                  strokeDasharray={stroke.dash}
                  markerEnd="url(#governance-orgchart-arrow)"
                />
                {edge.label ? (
                  <>
                    <rect
                      x={middleX - 50}
                      y={middleY - 10}
                      width="100"
                      height="18"
                      fill="rgba(255,255,255,0.95)"
                      rx="4"
                    />
                    <text
                      x={middleX}
                      y={middleY + 3}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#1e293b"
                    >
                      {edge.label}
                    </text>
                  </>
                ) : null}
              </g>
            );
          })}
        </svg>

        {orgChart.groups.map((group) => (
          <div
            key={group.id}
            className="absolute rounded-lg border-2 border-dashed border-slate-300 p-2"
            style={{
              left: group.x,
              top: group.y,
              width: group.width,
              height: group.height,
              backgroundColor: `${group.color}66`
            }}
          >
            {group.name ? (
              <div className="inline-flex rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {group.name}
              </div>
            ) : null}
          </div>
        ))}

        {orgChart.nodes.map((node) => (
          <article
            key={node.id}
            className="absolute overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            style={{ left: node.x, top: node.y, width: 220, minHeight: 110 }}
          >
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {node.image ? (
                  <img src={node.image} alt={node.name || ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
                    {node.name ? getInitials(node.name) : null}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {node.name ? (
                  <h4 className="truncate text-sm font-semibold text-slate-900">{node.name}</h4>
                ) : null}
                {node.position ? (
                  <p className="mt-0.5 truncate text-xs font-medium uppercase tracking-wide text-blue-700">
                    {node.position}
                  </p>
                ) : null}
              </div>
            </div>
            {node.experience ? (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{node.experience}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  </div>
);

const GovernanceTreeNode = ({ node, level = 0 }) => {
  const hasChildren = Array.isArray(node?.children) && node.children.length > 0;
  const name = String(node?.name || '').trim();
  const position = String(node?.position || '').trim();
  const experience = String(node?.experience || '').trim();
  const imageUrl = String(node?.image || '').trim();
  const initials = getInitials(name);

  return (
    <li className="relative">
      {level > 0 ? <span className="absolute -left-6 top-12 h-px w-6 bg-slate-300" /> : null}

      <article
        className={`relative overflow-hidden rounded-xl border bg-white p-4 transition sm:p-5 ${
          level === 0
            ? 'border-blue-200 shadow-md'
            : 'border-slate-200 shadow-sm hover:border-[var(--ngo-border)]'
        }`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            level === 0
              ? 'bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]'
              : 'bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)]'
          }`}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 sm:h-28 sm:w-28">
            {imageUrl ? (
              <img src={imageUrl} alt={name || ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-100 text-base font-semibold text-slate-700">
                {name ? initials : null}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {position ? (
                <p className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {position}
                </p>
              ) : null}
              {level === 0 ? (
                <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  Leadership
                </span>
              ) : null}
            </div>
            {name ? <h3 className="mt-2 text-lg font-semibold text-slate-900">{name}</h3> : null}
            {experience ? <p className="mt-1 text-sm leading-6 text-slate-600">{experience}</p> : null}
          </div>
        </div>
      </article>

      {hasChildren ? (
        <ul className="relative ml-8 mt-4 space-y-4 border-l-2 border-slate-200 pl-6">
          {node.children.map((child, index) => (
            <GovernanceTreeNode
              key={child?.id || `${level}-${index}`}
              node={child}
              level={level + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

const Governance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getGovernance();
        setData(response.data || null);
      } catch {
        setError('Failed to load governance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-[var(--ngo-border)] bg-slate-50 px-5 py-4 text-center text-slate-700">
          {error}
        </div>
      </div>
    );
  }

  const hierarchy = Array.isArray(data?.hierarchy) ? data.hierarchy : [];
  const orgChart = normalizeOrgChart(data?.orgChart);
  const useOrgChart = orgChart.enabled && orgChart.nodes.length > 0;
  const needTitle = String(data?.needTitle || data?.ethicsTitle || 'Need Of Governance').trim();
  const needContent = String(data?.needContent || data?.ethicsContent || '').trim();
  const policyTitle = String(data?.policyTitle || 'Making Policies & Decisions').trim();
  const policyIntro = String(data?.policyIntro || '').trim();
  const legacyPolicyTiers = Array.isArray(data?.ethicsPoints)
    ? data.ethicsPoints
      .map((point, index) => {
        const fallbackCode = index < 26 ? `${String.fromCharCode(65 + index)}.)` : `${index + 1}.`;
        return {
          code: fallbackCode,
          title: DEFAULT_POLICY_TIER_TITLES[index] || '',
          content: String(point || '').trim()
        };
      })
      .filter((tier) => tier.content)
    : [];
  const policyTiers =
    Array.isArray(data?.policyTiers) && data.policyTiers.length > 0
      ? data.policyTiers
        .map((tier, index) => {
          const fallbackCode = index < 26 ? `${String.fromCharCode(65 + index)}.)` : `${index + 1}.`;
          return {
            code: String(tier?.code || fallbackCode).trim(),
            title: String(tier?.title || DEFAULT_POLICY_TIER_TITLES[index] || '').trim(),
            content: String(tier?.content || '').trim()
          };
        })
        .filter((tier) => tier.code || tier.title || tier.content)
      : legacyPolicyTiers;
  const memberCount = useOrgChart ? orgChart.nodes.length : countHierarchyMembers(hierarchy);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">
          {data?.title || 'Governance'}
        </h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Our governance model is built on transparent leadership, clear responsibility, and ethical decision-making.
        </p>
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">
                {useOrgChart ? 'Organizational Organogram' : 'Organizational Hierarchy'}
              </h2>
              <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
              </span>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {useOrgChart ? (
              <GovernanceOrgChart orgChart={orgChart} />
            ) : hierarchy.length > 0 ? (
              <ul className="space-y-4">
                {hierarchy.map((node, index) => (
                  <GovernanceTreeNode key={node?.id || `root-${index}`} node={node} />
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-[var(--ngo-border)] bg-slate-50 px-4 py-3 text-sm text-slate-800">
                Governance hierarchy is being updated.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--ngo-border)] bg-white shadow-md">
          <div className="bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <h2 className="text-xl font-semibold text-white">
              {needTitle || 'Need Of Governance'}
            </h2>
          </div>

          <div className="p-4 md:p-5">
            {needContent ? (
              <p className="text-sm leading-7 text-slate-700 md:text-base">{needContent}</p>
            ) : (
              <div className="rounded-xl border border-[var(--ngo-border)] bg-slate-50 px-4 py-3 text-sm text-slate-800">
                Governance context is being updated.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[var(--ngo-border)] bg-white shadow-md">
          <div className="bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">
                {policyTitle || 'Making Policies & Decisions'}
              </h2>
              <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                {policyTiers.length} {policyTiers.length === 1 ? 'Tier' : 'Tiers'}
              </span>
            </div>
          </div>

          <div className="space-y-5 p-4 md:p-5">
            {policyIntro ? (
              <p className="text-sm leading-7 text-slate-700 md:text-base">{policyIntro}</p>
            ) : null}

            {policyTiers.length > 0 ? (
              <div className="grid gap-3">
                {policyTiers.map((tier, index) => (
                  <div
                    key={`policy-tier-${index}`}
                    className="rounded-xl border border-[var(--ngo-border)] bg-slate-50 p-4"
                  >
                    <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
                      <span className="inline-flex items-center rounded-full bg-[var(--ngo-primary)] px-2 py-0.5 text-xs font-semibold text-white">
                        {tier.code || `${index + 1}.`}
                      </span>
                      {tier.title || `Tier ${index + 1}`}
                    </h3>
                    {tier.content ? (
                      <p className="mt-2 text-sm leading-6 text-slate-700">{tier.content}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--ngo-border)] bg-slate-50 px-4 py-3 text-sm text-slate-800">
                Policy and decision details are being updated.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Governance;


