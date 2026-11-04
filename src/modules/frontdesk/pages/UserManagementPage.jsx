import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  Mail,
  User,
  Sparkles,
  RefreshCw,
  X,
  ShieldCheck,
  UserCheck,
  Check,
} from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} from "../services/frontdeskApi";
import { useAuth } from "../../../context/AuthContext";

const ROLE_BADGES = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  manager: "bg-amber-50 text-amber-700 border-amber-200",
  supervisor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  receptionist: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    full_name: "",
    username: "",
    email: "",
    role: "receptionist",
    password: "",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    role: "receptionist",
    is_active: true,
  });

  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      setUsers(res.users || res.data || []);
    } catch (err) {
      showToast(err.message || "Failed to load staff accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Quick password generator
  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setCreateForm({
      full_name: "",
      username: "",
      email: "",
      role: "receptionist",
      password: generateRandomPassword(),
    });
    setCreateModalOpen(true);
  };

  // Submit Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createForm.full_name || !createForm.username || !createForm.password) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    try {
      setSubmitting(true);
      await createUser(createForm);
      showToast(`User account '${createForm.username}' created successfully!`);
      setCreateModalOpen(false);
      loadUsers();
    } catch (err) {
      showToast(err.message || "Failed to create user account", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (u) => {
    setSelectedUser(u);
    setEditForm({
      full_name: u.full_name || "",
      email: u.email || "",
      role: u.role || "receptionist",
      is_active: u.is_active !== false,
    });
    setEditModalOpen(true);
  };

  // Submit Edit User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      await updateUser(selectedUser.id, editForm);
      showToast(`User account '${selectedUser.username}' updated successfully!`);
      setEditModalOpen(false);
      loadUsers();
    } catch (err) {
      showToast(err.message || "Failed to update user account", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Reset Password Modal
  const handleOpenResetModal = (u) => {
    setSelectedUser(u);
    setNewPassword(generateRandomPassword());
    setResetModalOpen(true);
  };

  // Submit Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    try {
      setSubmitting(true);
      await resetUserPassword(selectedUser.id, newPassword);
      showToast(`Password for '${selectedUser.username}' has been reset successfully!`);
      setResetModalOpen(false);
    } catch (err) {
      showToast(err.message || "Failed to reset password", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (u) => {
    if (u.id === currentUser?.id) {
      showToast("You cannot delete your own logged-in account", "error");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user '${u.username}' (${u.full_name})?`)) {
      return;
    }
    try {
      await deleteUser(u.id);
      showToast(`User '${u.username}' deleted successfully`);
      loadUsers();
    } catch (err) {
      showToast(err.message || "Failed to delete user", "error");
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const receptionistCount = users.filter((u) => u.role === "receptionist").length;
  const activeCount = users.filter((u) => u.is_active !== false).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold shadow-xl transition-all ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{users.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Administrators</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{adminCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Receptionists</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">{receptionistCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Status</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Check size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600">{activeCount}</p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by staff name, username, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={loading}
            title="Refresh staff list"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <UserPlus size={15} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* USERS DIRECTORY TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Staff & User Accounts ({filteredUsers.length})
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Administrator Access Only
          </span>
        </div>

        {loading ? (
          <div className="flex h-56 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-14 text-center">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-700">No staff accounts found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click "Add New User" to register your staff</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const roleStyle = ROLE_BADGES[u.role] || "bg-slate-50 text-slate-700 border-slate-200";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-black text-xs shadow-xs">
                            {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{u.full_name}</span>
                              {isCurrent && (
                                <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-black text-amber-800">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">ID: #{u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                          {u.username}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${roleStyle}`}>
                          <Shield size={11} />
                          {u.role || "staff"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.is_active !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-slate-500">
                        {u.email || <span className="italic text-slate-400">None</span>}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenResetModal(u)}
                            title="Reset User Password"
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-amber-400 hover:bg-amber-50/60 hover:text-amber-800 transition"
                          >
                            <KeyRound size={13} className="text-amber-600" />
                            <span>Reset Pass</span>
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit User Details"
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-800 transition"
                          >
                            <Edit3 size={13} className="text-blue-600" />
                            <span>Edit</span>
                          </button>

                          {/* Delete User */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Delete User Account"
                              className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD NEW USER */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm">Add New Staff Account</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Bikila"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. abebe"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-800 font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. staff@tabor.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Role Assignment *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="receptionist">Receptionist (Front Desk & Reservations)</option>
                  <option value="supervisor">Supervisor (Front Desk & Reports)</option>
                  <option value="manager">Manager (Operations & Staff)</option>
                  <option value="admin">Administrator (Full Control & User Management)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">
                    Initial Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, password: generateRandomPassword() })}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <Sparkles size={12} />
                    Generate
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Provide these credentials to the staff member for login.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  <span>{submitting ? "Creating..." : "Create User"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <KeyRound size={17} className="text-amber-400" />
                <h3 className="font-bold text-sm">Reset User Password</h3>
              </div>
              <button
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-5 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <p className="text-[11px] text-slate-500">Resetting credentials for:</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {selectedUser.full_name} <span className="font-mono text-slate-500">(@{selectedUser.username})</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">
                    New Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateRandomPassword())}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <Sparkles size={12} />
                    Generate
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition disabled:opacity-50"
                >
                  <KeyRound size={14} />
                  <span>{submitting ? "Saving..." : "Set New Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <Edit3 size={17} className="text-blue-400" />
                <h3 className="font-bold text-sm">Edit User: {selectedUser.username}</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="receptionist">Receptionist</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="user_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="user_active" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Account is Active (Can sign in)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <span>{submitting ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

