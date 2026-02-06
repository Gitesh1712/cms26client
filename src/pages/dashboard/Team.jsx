import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Search,
  Shield,
  User as UserIcon,
  Phone,
  Power,
} from "lucide-react";
import { api } from "../../services/api";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';




const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); 
  const [editingUser, setEditingUser] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "member",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await api.get("/users", {
        Authorization: `Bearer ${token}`,
      });
      setUsers(response?.data?.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo") || "{}");

    if (userInfo.role !== "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", email: "", mobile: "", password: "", role: "member" });
    setEditingUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setFormData({
      name: user.name || "",
      email: user.email,
      mobile: user.mobile || "",
      password: "",
      role: user.role,
    });
    setEditingUser(user);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const token = sessionStorage.getItem("token");

      if (modalMode === "add") {
        await api.post("/users", formData, {
          Authorization: `Bearer ${token}`,
        });
        toast.success("User created successfully!");
      } else {
        const updateData = { 
          name: formData.name,
          email: formData.email, 
          mobile: formData.mobile,
          role: formData.role 
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/users/${editingUser._id}`, updateData, {
          Authorization: `Bearer ${token}`,
        });
        toast.success("User updated successfully!");
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Failed to save user:", err);
      toast.error(err.message || "Failed to save user. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await api.delete(`/users/${id}`, { Authorization: `Bearer ${token}` });
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error(err.message || "Failed to delete user.");
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await api.post(
        '/users/toggle-status',
        { userId: id },
        { Authorization: `Bearer ${token}` }
      );
      toast.success("User status updated successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle user status:", err);
      toast.error(err.message || "Failed to update user status.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
    
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-orange-500" size={24} />
            Team Management
          </h2>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] hover:shadow-[0_0_30px_rgba(255,122,24,0.5)] flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

     
      <div className="relative max-w-md">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
        />
      </div>

     
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
          <p className="text-slate-400">Loading users...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle size={24} />
            <span className="font-semibold">Error</span>
          </div>
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-white/10 rounded-2xl text-center text-slate-500">
          <div className="flex justify-center mb-4">
            <Users size={48} className="opacity-20" />
          </div>
          <p className="text-lg mb-4">
            {searchTerm ? "No users match your search" : "No users found"}
          </p>
          {!searchTerm && (
            <button
              onClick={openAddModal}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Add your first team member
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-800/50 border-b border-white/10">
                <tr>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden md:table-cell">
                    Mobile
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-right px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm md:text-base">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm md:text-base truncate max-w-[120px] sm:max-w-none">
                            {user.name || 'No name'}
                          </p>
                          <p className="text-slate-500 text-xs truncate max-w-[120px] sm:max-w-none">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        {user.mobile ? (
                          <>
                            <Phone size={14} className="text-slate-500" />
                            <span>{user.mobile}</span>
                          </>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield size={12} />
                        ) : (
                          <UserIcon size={12} />
                        )}
                        <span className="hidden sm:inline">
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          user.isActive ? "bg-green-400" : "bg-red-400"
                        }`}></div>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex justify-end gap-1 md:gap-2">
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleToggleActive(user._id)}
                            className={`p-2 rounded-lg transition-all ${
                              user.isActive
                                ? "text-slate-400 hover:text-white hover:bg-red-500"
                                : "text-slate-400 hover:text-white hover:bg-green-500"
                            }`}
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            <Power size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-blue-500 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

   
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {modalMode === "add" ? "Add New User" : "Edit User"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Mobile
                </label>
                <input
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  maxLength={15}
                  pattern="^[+]?[0-9\s\-]{0,15}$"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                  placeholder="+91 98765 43210"
                />
                <p className="text-xs text-slate-500">Only numbers, spaces, dashes and + allowed (max 15 chars)</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Password{" "}
                  {modalMode === "add" && (
                    <span className="text-red-400">*</span>
                  )}
                  {modalMode === "edit" && (
                    <span className="text-slate-500 text-xs ml-1">
                      (leave blank to keep current)
                    </span>
                  )}
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalMode === "add"}
                  minLength={6}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
                >
                  <option value="member">Member</option>
                  
                 
                
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(255,122,24,0.3)] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : modalMode === "add" ? (
                    <Plus size={20} />
                  ) : (
                    <Edit2 size={20} />
                  )}
                  {modalMode === "add" ? "Add User" : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
