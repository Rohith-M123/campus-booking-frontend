
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Users as UsersIcon, Search, UserPlus, ShieldAlert, ShieldCheck, Mail, Building, X } from 'lucide-react';

interface UsersPageProps {
  users: User[];
  onToggleBlock: (id: string) => void;
  onAddUser: (user: User) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ users, onToggleBlock, onAddUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: UserRole.FACULTY,
    department: ''
  });

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u-${Date.now()}`,
      ...newUserData
    };
    onAddUser(newUser);
    setIsModalOpen(false);
    setNewUserData({ name: '', email: '', role: UserRole.FACULTY, department: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage Faculty and Student Coordinator access.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <UserPlus size={20} />
          Create Account
        </button>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
          <Search size={20} />
        </span>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full pl-12 pr-4 py-4 glass rounded-3xl border-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass overflow-hidden rounded-[2.5rem]">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-8 py-5">User</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">Department</th>
              <th className="px-8 py-5 text-right">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === UserRole.ADMIN ? 'bg-rose-100 text-rose-600' :
                    u.role === UserRole.FACULTY ? 'bg-blue-100 text-blue-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="text-sm font-medium">{u.department || 'N/A'}</div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button
                    onClick={() => onToggleBlock(u.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${u.status === 'BLOCKED'
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    disabled={u.role === UserRole.ADMIN}
                  >
                    {u.status === 'BLOCKED' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                    {u.status === 'BLOCKED' ? 'Blocked' : 'Active'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold">Create Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  required
                  type="text"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newUserData.name}
                  onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newUserData.email}
                  onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newUserData.role}
                    onChange={e => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                  >
                    <option value={UserRole.FACULTY}>Faculty</option>
                    <option value={UserRole.COORDINATOR}>Coordinator</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Department</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newUserData.department}
                    onChange={e => setNewUserData({ ...newUserData, department: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
