import React, { useEffect, useMemo, useRef, useState } from 'react';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 110;

const RELATION_OPTIONS = [
  { value: 'reports_to', label: 'Reports To' },
  { value: 'advises', label: 'Advises' },
  { value: 'dotted_line', label: 'Dotted Line' },
  { value: 'supports', label: 'Supports' }
];

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toColor = (value) => {
  const candidate = String(value || '').trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(candidate) ? candidate : '#dbeafe';
};

const createDefaultOrgChart = () => ({
  enabled: false,
  width: 1400,
  height: 900,
  groups: [],
  nodes: [],
  edges: []
});

const normalizeOrgChart = (orgChart) => {
  const source = orgChart && typeof orgChart === 'object' ? orgChart : {};
  const width = clamp(Math.round(toNumber(source.width, 1400)), 900, 3000);
  const height = clamp(Math.round(toNumber(source.height, 900)), 600, 2400);

  const groups = Array.isArray(source.groups)
    ? source.groups.map((group, index) => ({
      id: String(group?.id || `group-${index}`),
      name: String(group?.name || '').trim(),
      color: toColor(group?.color),
      x: clamp(Math.round(toNumber(group?.x, 40)), 0, width - 100),
      y: clamp(Math.round(toNumber(group?.y, 40)), 0, height - 80),
      width: clamp(Math.round(toNumber(group?.width, 360)), 200, width),
      height: clamp(Math.round(toNumber(group?.height, 220)), 140, height)
    }))
    : [];

  const nodes = Array.isArray(source.nodes)
    ? source.nodes.map((node, index) => ({
      id: String(node?.id || `node-${index}`),
      name: String(node?.name || '').trim(),
      position: String(node?.position || '').trim(),
      experience: String(node?.experience || '').trim(),
      image: String(node?.image || '').trim(),
      groupId: String(node?.groupId || ''),
      x: clamp(Math.round(toNumber(node?.x, 80)), 0, width - NODE_WIDTH),
      y: clamp(Math.round(toNumber(node?.y, 80)), 0, height - NODE_HEIGHT)
    }))
    : [];

  const nodeIds = new Set(nodes.map((node) => node.id));

  const edges = Array.isArray(source.edges)
    ? source.edges
      .map((edge, index) => ({
        id: String(edge?.id || `edge-${index}`),
        source: String(edge?.source || ''),
        target: String(edge?.target || ''),
        relation: RELATION_OPTIONS.some((item) => item.value === edge?.relation)
          ? edge.relation
          : 'reports_to',
        label: String(edge?.label || '').trim()
      }))
      .filter((edge) => edge.source && edge.target && edge.source !== edge.target)
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
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

const OrgChartEditor = ({ value, onChange, onUploadImage }) => {
  const chart = useMemo(() => normalizeOrgChart(value), [value]);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [pendingUploadNodeId, setPendingUploadNodeId] = useState('');
  const [uploadingNodeId, setUploadingNodeId] = useState('');
  const dragStateRef = useRef(null);
  const canvasViewportRef = useRef(null);
  const imageUploadInputRef = useRef(null);

  useEffect(() => {
    if (!chart.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(chart.nodes[0]?.id || '');
    }
  }, [chart.nodes, selectedNodeId]);

  useEffect(() => {
    if (!chart.groups.some((group) => group.id === selectedGroupId)) {
      setSelectedGroupId(chart.groups[0]?.id || '');
    }
  }, [chart.groups, selectedGroupId]);

  const commit = (updater) => {
    const current = normalizeOrgChart(value);
    const next = typeof updater === 'function' ? updater(current) : updater;
    onChange(normalizeOrgChart(next));
  };

  const updateNodePosition = (nodeId, nextX, nextY) => {
    commit((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === nodeId
          ? {
            ...node,
            x: clamp(Math.round(nextX), 0, current.width - NODE_WIDTH),
            y: clamp(Math.round(nextY), 0, current.height - NODE_HEIGHT)
          }
          : node
      )
    }));
  };

  const updateGroupPosition = (groupId, nextX, nextY) => {
    commit((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === groupId
          ? {
            ...group,
            x: clamp(Math.round(nextX), 0, current.width - group.width),
            y: clamp(Math.round(nextY), 0, current.height - group.height)
          }
          : group
      )
    }));
  };

  const updateGroupSize = (groupId, nextWidth, nextHeight) => {
    commit((current) => ({
      ...current,
      groups: current.groups.map((group) => {
        if (group.id !== groupId) return group;
        const maxWidth = Math.max(200, current.width - group.x);
        const maxHeight = Math.max(140, current.height - group.y);
        return {
          ...group,
          width: clamp(Math.round(nextWidth), 200, maxWidth),
          height: clamp(Math.round(nextHeight), 140, maxHeight)
        };
      })
    }));
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      const dragState = dragStateRef.current;
      if (!dragState || !canvasViewportRef.current) return;

      const viewport = canvasViewportRef.current;
      const bounds = viewport.getBoundingClientRect();
      if (dragState.type === 'node') {
        const x = event.clientX - bounds.left + viewport.scrollLeft - dragState.offsetX;
        const y = event.clientY - bounds.top + viewport.scrollTop - dragState.offsetY;
        updateNodePosition(dragState.nodeId, x, y);
        return;
      }

      if (dragState.type === 'group') {
        const x = event.clientX - bounds.left + viewport.scrollLeft - dragState.offsetX;
        const y = event.clientY - bounds.top + viewport.scrollTop - dragState.offsetY;
        updateGroupPosition(dragState.groupId, x, y);
        return;
      }

      if (dragState.type === 'group-resize') {
        const nextWidth = dragState.originWidth + (event.clientX - dragState.startClientX);
        const nextHeight = dragState.originHeight + (event.clientY - dragState.startClientY);
        updateGroupSize(dragState.groupId, nextWidth, nextHeight);
      }
    };

    const handleMouseUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [value]);

  const selectedNode = chart.nodes.find((node) => node.id === selectedNodeId) || null;

  const handleNodeMouseDown = (event, node) => {
    if (!canvasViewportRef.current) return;
    if (event.button !== 0) return;
    event.preventDefault();

    const viewport = canvasViewportRef.current;
    const bounds = viewport.getBoundingClientRect();
    dragStateRef.current = {
      type: 'node',
      nodeId: node.id,
      offsetX: event.clientX - bounds.left + viewport.scrollLeft - node.x,
      offsetY: event.clientY - bounds.top + viewport.scrollTop - node.y
    };
    setSelectedNodeId(node.id);
  };

  const handleGroupMouseDown = (event, group) => {
    if (!canvasViewportRef.current) return;
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const viewport = canvasViewportRef.current;
    const bounds = viewport.getBoundingClientRect();
    dragStateRef.current = {
      type: 'group',
      groupId: group.id,
      offsetX: event.clientX - bounds.left + viewport.scrollLeft - group.x,
      offsetY: event.clientY - bounds.top + viewport.scrollTop - group.y
    };
    setSelectedGroupId(group.id);
  };

  const handleGroupResizeMouseDown = (event, group) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      type: 'group-resize',
      groupId: group.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originWidth: group.width,
      originHeight: group.height
    };
    setSelectedGroupId(group.id);
  };

  const addGroup = () => {
    const id = createId('group');
    commit((current) => ({
      ...current,
      groups: [
        ...current.groups,
        {
          id,
          name: `Unit ${current.groups.length + 1}`,
          color: '#dbeafe',
          x: 40 + current.groups.length * 20,
          y: 40 + current.groups.length * 20,
          width: 360,
          height: 220
        }
      ]
    }));
  };

  const addNode = () => {
    const id = createId('node');
    commit((current) => ({
      ...current,
      nodes: [
        ...current.nodes,
        {
          id,
          name: '',
          position: '',
          experience: '',
          image: '',
          groupId: current.groups[0]?.id || '',
          x: 90 + current.nodes.length * 22,
          y: 90 + current.nodes.length * 22
        }
      ]
    }));
    setSelectedNodeId(id);
  };

  const addEdge = () => {
    if (chart.nodes.length < 2) return;
    commit((current) => ({
      ...current,
      edges: [
        ...current.edges,
        {
          id: createId('edge'),
          source: current.nodes[0].id,
          target: current.nodes[1].id,
          relation: 'reports_to',
          label: ''
        }
      ]
    }));
  };

  const startImageUploadForNode = (nodeId) => {
    if (!onUploadImage) {
      window.alert('Image upload is not configured.');
      return;
    }
    setPendingUploadNodeId(nodeId);
    imageUploadInputRef.current?.click();
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        ref={imageUploadInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          const targetNodeId = pendingUploadNodeId;
          if (!file || !targetNodeId) {
            event.target.value = '';
            return;
          }

          try {
            setUploadingNodeId(targetNodeId);
            const response = await onUploadImage(file);
            const imageUrl = String(response?.data?.imageUrl || '').trim();
            if (!imageUrl) {
              throw new Error('Upload succeeded but no image URL returned');
            }
            commit((current) => ({
              ...current,
              nodes: current.nodes.map((item) =>
                item.id === targetNodeId ? { ...item, image: imageUrl } : item
              )
            }));
          } catch (error) {
            console.error(error);
            window.alert('Failed to upload image');
          } finally {
            setUploadingNodeId('');
            setPendingUploadNodeId('');
            event.target.value = '';
          }
        }}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Advanced Organogram Builder</h3>
          <p className="text-sm text-slate-600">
            Manage a graph with groups, draggable people nodes, and multi-type relationships.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={chart.enabled}
            onChange={(event) =>
              commit((current) => ({ ...current, enabled: event.target.checked }))
            }
          />
          Use Graph Organogram on Website
        </label>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium text-slate-700">
          Canvas Width
          <input
            type="number"
            min="900"
            max="3000"
            value={chart.width}
            onChange={(event) =>
              commit((current) => ({
                ...current,
                width: clamp(Math.round(toNumber(event.target.value, current.width)), 900, 3000)
              }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Canvas Height
          <input
            type="number"
            min="600"
            max="2400"
            value={chart.height}
            onChange={(event) =>
              commit((current) => ({
                ...current,
                height: clamp(Math.round(toNumber(event.target.value, current.height)), 600, 2400)
              }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={addGroup}
            className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Group
          </button>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={addNode}
            className="w-full rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Add Person
          </button>
        </div>
      </div>

      <div className="mb-5 overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          Canvas Preview (drag cards to position)
        </div>
        <div ref={canvasViewportRef} className="max-h-[36rem] overflow-auto bg-slate-100">
          <div
            className="relative"
            style={{
              width: chart.width,
              height: chart.height,
              backgroundImage:
                'linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              <defs>
                <marker
                  id="orgchart-arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
                </marker>
              </defs>
              {chart.edges.map((edge) => {
                const source = chart.nodes.find((node) => node.id === edge.source);
                const target = chart.nodes.find((node) => node.id === edge.target);
                if (!source || !target) return null;

                const fromX = source.x + NODE_WIDTH / 2;
                const fromY = source.y + NODE_HEIGHT / 2;
                const toX = target.x + NODE_WIDTH / 2;
                const toY = target.y + NODE_HEIGHT / 2;
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
                      markerEnd="url(#orgchart-arrow)"
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

            {chart.groups.map((group) => (
              <div
                key={group.id}
                onMouseDown={(event) => handleGroupMouseDown(event, group)}
                className={`absolute rounded-lg border-2 border-dashed p-2 ${
                  selectedGroupId === group.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-slate-300'
                }`}
                style={{
                  left: group.x,
                  top: group.y,
                  width: group.width,
                  height: group.height,
                  backgroundColor: `${group.color}66`,
                  cursor: 'move'
                }}
              >
                <div className="inline-flex select-none rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {group.name || 'Unnamed Group'}
                </div>
                <button
                  type="button"
                  onMouseDown={(event) => handleGroupResizeMouseDown(event, group)}
                  className="absolute bottom-1 right-1 h-5 w-5 rounded border border-slate-300 bg-white/90 text-[10px] leading-none text-slate-600"
                  title="Resize group"
                >
                  R
                </button>
              </div>
            ))}

            {chart.nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onMouseDown={(event) => handleNodeMouseDown(event, node)}
                onClick={() => setSelectedNodeId(node.id)}
                className={`absolute rounded-lg border bg-white p-3 text-left shadow transition ${
                  selectedNodeId === node.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: NODE_WIDTH,
                  minHeight: NODE_HEIGHT
                }}
              >
                <p className="text-sm font-semibold text-slate-900">{node.name || 'Name Pending'}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-700">
                  {node.position || 'Position'}
                </p>
                {node.experience ? (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{node.experience}</p>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1.2fr_1fr]">
        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">Groups</h4>
          {chart.groups.length === 0 ? (
            <p className="text-xs text-slate-600">No groups yet.</p>
          ) : (
            <div className="space-y-2">
              {chart.groups.map((group) => (
                <div key={group.id} className="rounded border border-slate-200 bg-white p-2">
                  <input
                    type="text"
                    value={group.name}
                    onChange={(event) =>
                      commit((current) => ({
                        ...current,
                        groups: current.groups.map((item) =>
                          item.id === group.id ? { ...item, name: event.target.value } : item
                        )
                      }))
                    }
                    placeholder="Group name"
                    className="mb-2 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="color"
                      value={group.color}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          groups: current.groups.map((item) =>
                            item.id === group.id ? { ...item, color: toColor(event.target.value) } : item
                          )
                        }))
                      }
                      className="h-8 w-full rounded border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        commit((current) => ({
                          ...current,
                          groups: current.groups.filter((item) => item.id !== group.id),
                          nodes: current.nodes.map((node) =>
                            node.groupId === group.id ? { ...node, groupId: '' } : node
                          )
                        }))
                      }
                      className="rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="text-xs text-slate-700">
                      X
                      <input
                        type="number"
                        value={group.x}
                        onChange={(event) =>
                          updateGroupPosition(
                            group.id,
                            toNumber(event.target.value, group.x),
                            group.y
                          )
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                      />
                    </label>
                    <label className="text-xs text-slate-700">
                      Y
                      <input
                        type="number"
                        value={group.y}
                        onChange={(event) =>
                          updateGroupPosition(
                            group.id,
                            group.x,
                            toNumber(event.target.value, group.y)
                          )
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                      />
                    </label>
                    <label className="text-xs text-slate-700">
                      Width
                      <input
                        type="number"
                        min="200"
                        max={chart.width}
                        value={group.width}
                        onChange={(event) =>
                          updateGroupSize(
                            group.id,
                            toNumber(event.target.value, group.width),
                            group.height
                          )
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                      />
                    </label>
                    <label className="text-xs text-slate-700">
                      Height
                      <input
                        type="number"
                        min="140"
                        max={chart.height}
                        value={group.height}
                        onChange={(event) =>
                          updateGroupSize(
                            group.id,
                            group.width,
                            toNumber(event.target.value, group.height)
                          )
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <h4 className="mb-2 text-sm font-semibold text-slate-900">
            People Nodes ({chart.nodes.length})
          </h4>
          {chart.nodes.length === 0 ? (
            <p className="text-xs text-slate-600">No nodes yet.</p>
          ) : (
            <div className="space-y-3">
              {chart.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`rounded border bg-white p-2 ${
                    selectedNode?.id === node.id ? 'border-blue-400' : 'border-slate-200'
                  }`}
                >
                  <div className="mb-2 grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={node.name}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          nodes: current.nodes.map((item) =>
                            item.id === node.id ? { ...item, name: event.target.value } : item
                          )
                        }))
                      }
                      placeholder="Name"
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    />
                    <input
                      type="text"
                      value={node.position}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          nodes: current.nodes.map((item) =>
                            item.id === node.id ? { ...item, position: event.target.value } : item
                          )
                        }))
                      }
                      placeholder="Position"
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    />
                  </div>
                  <textarea
                    value={node.experience}
                    onChange={(event) =>
                      commit((current) => ({
                        ...current,
                        nodes: current.nodes.map((item) =>
                          item.id === node.id ? { ...item, experience: event.target.value } : item
                        )
                      }))
                    }
                    placeholder="Short bio"
                    rows={2}
                    className="mb-2 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={node.image}
                    onChange={(event) =>
                      commit((current) => ({
                        ...current,
                        nodes: current.nodes.map((item) =>
                          item.id === node.id ? { ...item, image: event.target.value } : item
                        )
                      }))
                    }
                    placeholder="Image URL"
                    className="mb-2 w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    disabled={!onUploadImage || uploadingNodeId === node.id}
                    onClick={() => startImageUploadForNode(node.id)}
                    className="mb-2 rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {uploadingNodeId === node.id ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={node.groupId}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          nodes: current.nodes.map((item) =>
                            item.id === node.id ? { ...item, groupId: event.target.value } : item
                          )
                        }))
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="">No group</option>
                      {chart.groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name || 'Unnamed Group'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className="rounded bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                    >
                      Focus
                    </button>
                    <label className="text-xs text-slate-700">
                      X
                      <input
                        type="number"
                        value={node.x}
                        onChange={(event) =>
                          updateNodePosition(node.id, toNumber(event.target.value, node.x), node.y)
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                      />
                    </label>
                    <label className="text-xs text-slate-700">
                      Y
                      <input
                        type="number"
                        value={node.y}
                        onChange={(event) =>
                          updateNodePosition(node.id, node.x, toNumber(event.target.value, node.y))
                        }
                        className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      commit((current) => ({
                        ...current,
                        nodes: current.nodes.filter((item) => item.id !== node.id),
                        edges: current.edges.filter(
                          (edge) => edge.source !== node.id && edge.target !== node.id
                        )
                      }))
                    }
                    className="mt-2 rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                  >
                    Remove Person
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900">Relations</h4>
            <button
              type="button"
              onClick={addEdge}
              disabled={chart.nodes.length < 2}
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Add Relation
            </button>
          </div>
          {chart.edges.length === 0 ? (
            <p className="text-xs text-slate-600">No relations yet.</p>
          ) : (
            <div className="space-y-2">
              {chart.edges.map((edge) => (
                <div key={edge.id} className="rounded border border-slate-200 bg-white p-2">
                  <div className="grid gap-2">
                    <select
                      value={edge.source}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          edges: current.edges.map((item) =>
                            item.id === edge.id ? { ...item, source: event.target.value } : item
                          )
                        }))
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {chart.nodes.map((node) => (
                        <option key={`source-${edge.id}-${node.id}`} value={node.id}>
                          {node.name || node.position || node.id}
                        </option>
                      ))}
                    </select>
                    <select
                      value={edge.target}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          edges: current.edges.map((item) =>
                            item.id === edge.id ? { ...item, target: event.target.value } : item
                          )
                        }))
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {chart.nodes.map((node) => (
                        <option key={`target-${edge.id}-${node.id}`} value={node.id}>
                          {node.name || node.position || node.id}
                        </option>
                      ))}
                    </select>
                    <select
                      value={edge.relation}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          edges: current.edges.map((item) =>
                            item.id === edge.id ? { ...item, relation: event.target.value } : item
                          )
                        }))
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {RELATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={edge.label}
                      onChange={(event) =>
                        commit((current) => ({
                          ...current,
                          edges: current.edges.map((item) =>
                            item.id === edge.id ? { ...item, label: event.target.value } : item
                          )
                        }))
                      }
                      placeholder="Optional label"
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      commit((current) => ({
                        ...current,
                        edges: current.edges.filter((item) => item.id !== edge.id)
                      }))
                    }
                    className="mt-2 rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-700"
                  >
                    Remove Relation
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrgChartEditor;

