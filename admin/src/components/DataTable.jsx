import React from 'react';

const DataTable = ({ data, columns, onEdit, onDelete }) => {
  const showActions = typeof onEdit === 'function' && typeof onDelete === 'function';
  const handleDelete = (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    onDelete(itemId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="py-2 px-4 border-b">{col.header}</th>
            ))}
            {showActions && <th className="py-2 px-4 border-b">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="py-2 px-4 border-b">{item[col.key]}</td>
              ))}
              {showActions && (
                <td className="py-2 px-4 border-b">
                  <button onClick={() => onEdit(item)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
