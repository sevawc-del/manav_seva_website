import React, { useRef, useState } from 'react';

const HierarchyNode = ({ node, onChange, onAddChild, onRemove, path, onUploadImage }) => {
  const imageInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFieldChange = (field, value) => {
    onChange(path, { ...node, [field]: value });
  };

  const handleAddChild = () => {
    const newChild = {
      id: `${node.id}-${Date.now()}`,
      name: '',
      position: '',
      experience: '',
      image: '',
      children: []
    };
    onAddChild(path, newChild);
  };

  const handleRemove = () => {
    onRemove(path);
  };

  return (
    <div className="border p-4 mb-4 rounded bg-gray-50">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={node.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Position"
          value={node.position || ''}
          onChange={(e) => handleFieldChange('position', e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Experience"
          value={node.experience || ''}
          onChange={(e) => handleFieldChange('experience', e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={node.image || ''}
          onChange={(e) => handleFieldChange('image', e.target.value)}
          className="p-2 border rounded"
        />
        <div>
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
                const imageUrl = response?.data?.imageUrl || '';
                if (!imageUrl) {
                  throw new Error('Upload succeeded but no image URL returned');
                }
                handleFieldChange('image', imageUrl);
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
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Choose Image'}
          </button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={handleAddChild}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Subordinate
        </button>
        {path.length > 0 && (
          <button
            type="button"
            onClick={handleRemove}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Remove
          </button>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="ml-6">
          {node.children.map((child, index) => (
            <HierarchyNode
              key={child.id}
              node={child}
              onChange={onChange}
              onAddChild={onAddChild}
              onRemove={onRemove}
              onUploadImage={onUploadImage}
              path={[...path, 'children', index]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchyForm = ({ hierarchy, onChange, onUploadImage }) => {
  const handleNodeChange = (path, updatedNode) => {
    const updateHierarchy = (nodes, currentPath) => {
      if (currentPath.length === 0) {
        return [updatedNode];
      }
      const [key, ...rest] = currentPath;
      if (typeof key === 'number') {
        return nodes.map((node, index) =>
          index === key ? updateHierarchy([node], rest)[0] : node
        );
      } else {
        return nodes.map(node => ({
          ...node,
          [key]: key === 'children' ? updateHierarchy(node.children || [], rest) : updatedNode[key]
        }));
      }
    };
    onChange(updateHierarchy(hierarchy, path));
  };

  const handleAddChild = (path, newChild) => {
    const addToHierarchy = (nodes, currentPath) => {
      if (currentPath.length === 0) {
        return [...nodes, newChild];
      }
      const [key, ...rest] = currentPath;
      if (typeof key === 'number') {
        return nodes.map((node, index) =>
          index === key ? { ...node, children: addToHierarchy(node.children || [], rest) } : node
        );
      } else if (key === 'children') {
        return addToHierarchy(nodes, rest);
      }
      return nodes;
    };
    onChange(addToHierarchy(hierarchy, path));
  };

  const handleRemove = (path) => {
    const removeFromHierarchy = (nodes, currentPath) => {
      if (currentPath.length === 1) {
        const index = currentPath[0];
        return nodes.filter((_, i) => i !== index);
      }
      const [key, ...rest] = currentPath;
      if (typeof key === 'number') {
        return nodes.map((node, index) =>
          index === key ? { ...node, children: removeFromHierarchy(node.children || [], rest) } : node
        );
      } else if (key === 'children') {
        return removeFromHierarchy(nodes, rest);
      }
      return nodes;
    };
    onChange(removeFromHierarchy(hierarchy, path));
  };

  return (
    <div>
      {hierarchy.map((node, index) => (
        <HierarchyNode
          key={node.id}
          node={node}
          onChange={handleNodeChange}
          onAddChild={handleAddChild}
          onRemove={handleRemove}
          onUploadImage={onUploadImage}
          path={[index]}
        />
      ))}
    </div>
  );
};

export default HierarchyForm;
