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
    .join('') || 'NA';

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
            : 'border-slate-200 shadow-sm hover:border-emerald-200'
        }`}
      >
        <div
          className={`absolute inset-x-0 top-0 h-1 ${
            level === 0
              ? 'bg-gradient-to-r from-blue-600 to-sky-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 sm:h-28 sm:w-28">
            {imageUrl ? (
              <img src={imageUrl} alt={name || 'Person'} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 text-base font-semibold text-slate-700">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                {position || 'Team Member'}
              </p>
              {level === 0 ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Leadership
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">{name || 'Name Pending'}</h3>
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
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-center text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  const hierarchy = Array.isArray(data?.hierarchy) ? data.hierarchy : [];
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
  const memberCount = countHierarchyMembers(hierarchy);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">
          {data?.title || 'Governance'}
        </h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Our governance model is built on transparent leadership, clear responsibility, and ethical decision-making.
        </p>
      </div>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Organizational Hierarchy</h2>
              <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
                {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
              </span>
            </div>
          </div>

          <div className="p-4 md:p-5">
            {hierarchy.length > 0 ? (
              <ul className="space-y-4">
                {hierarchy.map((node, index) => (
                  <GovernanceTreeNode key={node?.id || `root-${index}`} node={node} />
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Governance hierarchy is being updated.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4">
            <h2 className="text-xl font-semibold text-white">
              {needTitle || 'Need Of Governance'}
            </h2>
          </div>

          <div className="p-4 md:p-5">
            {needContent ? (
              <p className="text-sm leading-7 text-slate-700 md:text-base">{needContent}</p>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Governance context is being updated.
              </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-md">
          <div className="bg-gradient-to-r from-cyan-600 to-sky-500 px-5 py-4">
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
                    className="rounded-xl border border-cyan-100 bg-cyan-50/40 p-4"
                  >
                    <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900 md:text-base">
                      <span className="inline-flex items-center rounded-full bg-cyan-600 px-2 py-0.5 text-xs font-semibold text-white">
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
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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
