import React, { useState, useEffect } from 'react';
import Loader from '../../components/Loader';
import { getGovernance } from '../../utils/api';

const GovernanceTreeNode = ({ node, isChild = false }) => {
  const hasChildren = Array.isArray(node?.children) && node.children.length > 0;

  return (
    <li className="relative">
      {isChild && <span className="absolute -left-6 top-6 w-6 h-[2px] bg-gray-300" />}
      <div className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-4">
          {node.image && (
            <img
              src={node.image}
              alt={node.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div>
            <h3 className="text-lg font-medium text-gray-900">{node.name}</h3>
            <p className="text-blue-600 font-medium">{node.position}</p>
            {node.experience && <p className="text-gray-600 mt-1">{node.experience}</p>}
          </div>
        </div>
      </div>

      {hasChildren && (
        <ul className="mt-4 ml-8 pl-6 border-l-2 border-gray-300 space-y-4">
          {node.children.map((child, index) => (
            <GovernanceTreeNode key={child.id || index} node={child} isChild />
          ))}
        </ul>
      )}
    </li>
  );
};

const Governance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getGovernance();
        setData(response.data);
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{data.title}</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Organizational Hierarchy</h2>
          <ul className="space-y-4">
            {(data.hierarchy || []).map((node, index) => (
              <GovernanceTreeNode key={node.id || index} node={node} />
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">{data.ethicsTitle}</h2>
          <div className="prose max-w-none">
            <p className="mb-4">{data.ethicsContent}</p>
            <ul className="list-disc list-inside">
              {data.ethicsPoints && data.ethicsPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;
