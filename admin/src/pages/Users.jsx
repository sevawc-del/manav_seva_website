import React, { useContext, useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import { getUsers, createUser, updateUser, deleteUser } from '../utils/api';
import { AuthContext } from '../context/AuthContextValue';

const Users = () => {
  const { user } = useContext(AuthContext);
  const isEditor = user?.role === 'editor';
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [editing, setEditing] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateUser(editing._id, formData);
      } else {
        await createUser(formData);
      }
      setFormData({ username: '', email: '', password: '', role: 'admin' });
      setEditing(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ username: item.username, email: item.email, password: '', role: item.role });
    setEditing(item);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { header: 'Username', key: 'username' },
    { header: 'Email', key: 'email' },
    { header: 'Role', key: 'role' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      {!isEditor && (
        <form onSubmit={handleSubmit} className="mb-6">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            required={!editing}
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editing ? 'Update' : 'Add'} User
          </button>
        </form>
      )}
      <DataTable
        data={users}
        columns={columns}
        onEdit={isEditor ? undefined : handleEdit}
        onDelete={isEditor ? undefined : handleDelete}
      />
    </div>
  );
};

export default Users;
