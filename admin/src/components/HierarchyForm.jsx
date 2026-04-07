import React, { useRef, useState } from 'react';

const getInitials = (name = '') =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'NA';

const createEmptyNode = (parentId = 'node') => ({
  id: `${parentId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  position: '',
  experience: '',
  image: '',
  children: []
});

const updateNodeAtPath = (nodes, path, updater) => {
  if (!Array.isArray(nodes) || path.length === 0) return nodes;

  const [index, ...rest] = path;
  if (typeof index !== 'number') return nodes;

  return nodes.map((node, nodeIndex) => {
    if (nodeIndex !== index) return node;

    const safeNode = {
      ...node,
      children: Array.isArray(node?.children) ? node.children : []
    };

    if (rest.length === 0) {
      return updater(safeNode);
    }

    if (rest[0] !== 'children') {
      return safeNode;
    }

    return {
      ...safeNode,
      children: updateNodeAtPath(safeNode.children, rest.slice(1), updater)
    };
  });
};

const HierarchyNode = ({ node, onChange, onAddChild, onRemove, path, onUploadImage, level = 0 }) => {
  const imageInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const hasParent = path.length > 1;
  const imageUrl = String(node?.image || '').trim();
  const name = String(node?.name || '').trim();
  const initials = getInitials(name);

  const handleFieldChange = (field, value) => {
    onChange(path, { ...node, [field]: value });
  };

  const handleAddChild = () => {
    onAddChild(path, createEmptyNode(node?.id || 'node'));
  };

  const handleRemove = () => {
    onRemove(path);
  };

  return (
    <div className={`mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${level > 0 ? 'ml-2 sm:ml-4' : ''}`}>
      <div className="grid gap-5 p-4 lg:grid-cols-[10rem,1fr]">
        <div>
          <div className="mb-3 flex items-center gap-3 lg:block">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-300 bg-slate-100 shadow-sm">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name || 'Person'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 text-base font-semibold text-slate-700">
                  {initials}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 lg:mt-2">Photo preview</p>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (!onUploadImage) {
                  throw new Error('Image upload is not configured');
                }
                setUploading(true);
                const response = await onUploadImage(file);
                const uploadedImageUrl = response?.data?.imageUrl || '';
                if (!uploadedImageUrl) {
                  throw new Error('Upload succeeded but no image URL returned');
                }
                handleFieldChange('image', uploadedImageUrl);
              } catch (error) {
                console.error(error);
                alert('Failed to upload image');
              } finally {
                setUploading(false);
                e.target.value = '';
              }
            }}
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => imageInputRef.current?.click()}
            className="w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Name
            <input
              type="text"
              value={node?.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Person name"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Position
            <input
              type="text"
              value={node?.position || ''}
              onChange={(e) => handleFieldChange('position', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Role / position"
            />
          </label>

          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Experience / Bio
            <input
              type="text"
              value={node?.experience || ''}
              onChange={(e) => handleFieldChange('experience', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Brief experience summary"
            />
          </label>

          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Photo URL
            <input
              type="text"
              value={node?.image || ''}
              onChange={(e) => handleFieldChange('image', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="https://..."
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
        <button
          type="button"
          onClick={handleAddChild}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          Add Subordinate
        </button>
        {hasParent && (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Remove Person
          </button>
        )}
      </div>

      {Array.isArray(node?.children) && node.children.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/60 px-3 py-3 sm:px-5">
          <div className="ml-3 border-l-2 border-slate-200 pl-3 sm:ml-4 sm:pl-4">
            {node.children.map((child, index) => (
              <HierarchyNode
                key={child?.id || `${path.join('-')}-child-${index}`}
                node={child}
                onChange={onChange}
                onAddChild={onAddChild}
                onRemove={onRemove}
                onUploadImage={onUploadImage}
                path={[...path, 'children', index]}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const HierarchyForm = ({ hierarchy, onChange, onUploadImage }) => {
  const safeHierarchy = Array.isArray(hierarchy) ? hierarchy : [];

  const handleNodeChange = (path, updatedNode) => {
    onChange(updateNodeAtPath(safeHierarchy, path, () => updatedNode));
  };

  const handleAddChild = (path, newChild) => {
    onChange(
      updateNodeAtPath(safeHierarchy, path, (node) => ({
        ...node,
        children: [...(Array.isArray(node?.children) ? node.children : []), newChild]
      }))
    );
  };

  const handleRemove = (path) => {
    const targetIndex = path[path.length - 1];
    if (typeof targetIndex !== 'number') return;

    if (path.length === 1) {
      onChange(safeHierarchy.filter((_, index) => index !== targetIndex));
      return;
    }

    const parentPath = path.slice(0, -2);
    onChange(
      updateNodeAtPath(safeHierarchy, parentPath, (node) => ({
        ...node,
        children: (Array.isArray(node?.children) ? node.children : []).filter((_, index) => index !== targetIndex)
      }))
    );
  };

  return (
    <div className="space-y-4">
      {safeHierarchy.length > 0 ? (
        safeHierarchy.map((node, index) => (
          <HierarchyNode
            key={node?.id || `root-${index}`}
            node={node}
            onChange={handleNodeChange}
            onAddChild={handleAddChild}
            onRemove={handleRemove}
            onUploadImage={onUploadImage}
            path={[index]}
          />
        ))
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No hierarchy nodes yet. Add at least one person to build governance.
        </p>
      )}
    </div>
  );
};

export default HierarchyForm;
