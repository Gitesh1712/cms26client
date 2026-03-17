import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, AlertCircle, Pencil } from 'lucide-react';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const dispatchCategoriesUpdated = () => {
    window.dispatchEvent(new CustomEvent('categoriesUpdated'));
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userInfo = sessionStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const { role } = JSON.parse(userInfo);
                setIsAdmin(role === 'admin');
            } catch (err) {
                console.error('Failed to parse user info:', err);
            }
        }
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/public/categories');
            setCategories(response.data || []);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
            setError("Failed to load categories.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        setActionLoading(true);
        try {
            const id = newCategory.toLowerCase().trim().replace(/[\s]+/g, '-');
            const token = sessionStorage.getItem('token');
            await api.post('/categories/add', { id, name: newCategory }, { Authorization: `Bearer ${token}` });
            setNewCategory('');
            await fetchCategories();
            dispatchCategoriesUpdated();
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Error',
                text: err.data?.message || 'Failed to add category',
                confirmButtonColor: '#FF7A18', background: '#0f172a', color: '#e2e8f0'
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditCategory = async (category) => {
        const { value: newName, isConfirmed } = await Swal.fire({
            title: 'Edit Category',
            input: 'text',
            inputLabel: 'Category Name',
            inputValue: category.name,
            showCancelButton: true,
            confirmButtonColor: '#FF7A18',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Save Changes',
            cancelButtonText: 'Cancel',
            background: '#0f172a',
            color: '#e2e8f0',
            inputAttributes: { autocomplete: 'off' },
            customClass: { input: '', popup: 'swal-popup-custom' },
            inputValidator: (value) => {
                if (!value || !value.trim()) return 'Category name cannot be empty!';
                if (value.trim() === category.name) return 'Please enter a different name!';
            },
            didOpen: () => {
                const style = document.createElement('style');
                style.innerHTML = `
                    .swal-input-custom { background: #020617 !important; border: 1px solid #1e293b !important; border-radius: 12px !important; color: #e2e8f0 !important; padding: 12px 16px !important; font-size: 15px !important; width: 100% !important; box-sizing: border-box !important; }
                    .swal-input-custom:focus { border-color: rgba(255,122,24,0.5) !important; box-shadow: 0 0 0 1px rgba(255,122,24,0.5) !important; outline: none !important; }
                    .swal-popup-custom { border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px !important; }
                    .swal2-input-label { color: #94a3b8 !important; font-size: 13px !important; margin-bottom: 8px !important; }
                    .swal2-title { font-size: 20px !important; }
                `;
                document.head.appendChild(style);
            }
        });

        if (!isConfirmed || !newName?.trim()) return;
        setActionLoading(true);
        try {
            const token = sessionStorage.getItem('token');
           
            await api.put(
                `/categories/${category.id}`,
                { id: category.id, name: newName.trim() },
                { Authorization: `Bearer ${token}` }
            );
            await fetchCategories();
            dispatchCategoriesUpdated();
            Swal.fire({
                icon: 'success', title: 'Updated!', text: 'Category has been updated.',
                confirmButtonColor: '#FF7A18', background: '#0f172a', color: '#e2e8f0',
                timer: 1800, showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Error',
                text: err.message || 'Failed to update category',
                confirmButtonColor: '#FF7A18', background: '#0f172a', color: '#e2e8f0'
            });
        } finally {
            setActionLoading(false);
        }
    };
    const handleDeleteCategory = async (category) => {
        setActionLoading(true);
        try {
           
            const token = sessionStorage.getItem('token');
            const postsRes = await api.get('/posts', { Authorization: `Bearer ${token}` });
            const posts = Array.isArray(postsRes) ? postsRes : (postsRes?.data || []);

           
            const postsInCategory = posts.filter(
                p => String(p.category).toLowerCase() === String(category.id).toLowerCase()
            );

            setActionLoading(false);

            if (postsInCategory.length > 0) {
               
                await Swal.fire({
                    icon: 'warning',
                    title: 'Cannot Delete!',
                    html: `<p style="color:#94a3b8">The category <strong style="color:#f1f5f9">"${category.name}"</strong> has <strong style="color:#fb923c">${postsInCategory.length} post${postsInCategory.length > 1 ? 's' : ''}</strong> associated with it.</p>
                           <p style="color:#94a3b8;margin-top:8px">Please reassign or delete those posts first before deleting this category.</p>`,
                    confirmButtonColor: '#FF7A18',
                    confirmButtonText: 'Okay, Got it',
                    background: '#0f172a',
                    color: '#e2e8f0',
                });
                return;
            }
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#FF7A18',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                background: '#0f172a',
                color: '#e2e8f0',
            });

            if (!result.isConfirmed) return;

            setActionLoading(true);
            await api.delete(`/categories/${category.id}`, { Authorization: `Bearer ${token}` });
            await fetchCategories();
            dispatchCategoriesUpdated();

        } catch (err) {
            console.error("Failed to delete category:", err);
            Swal.fire({
                icon: 'error', title: 'Error',
                text: err.message || 'Failed to delete category',
                confirmButtonColor: '#FF7A18', background: '#0f172a', color: '#e2e8f0'
            });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-white">Categories</h2>
            </div>

            {isAdmin && (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Add New Category</h3>
                    <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <input
                            type="text" value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Category Name"
                            className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                        />
                        <button type="submit" disabled={!newCategory.trim() || actionLoading}
                            className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                            Add
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[300px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-3 md:p-4 text-slate-400 font-medium w-12 md:w-16 text-center text-xs md:text-sm">#</th>
                                <th className="p-3 md:p-4 text-slate-400 font-medium text-xs md:text-sm">Name</th>
                                {isAdmin && <th className="p-3 md:p-4 text-slate-400 font-medium w-28 md:w-32 text-right text-xs md:text-sm">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={isAdmin ? "3" : "2"} className="p-8 text-center text-slate-500">
                                    <div className="flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Loading categories...</div>
                                </td></tr>
                            ) : error ? (
                                <tr><td colSpan={isAdmin ? "3" : "2"} className="p-8 text-center text-red-400">
                                    <div className="flex items-center justify-center gap-2"><AlertCircle size={20} /> {error}</div>
                                </td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={isAdmin ? "3" : "2"} className="p-8 text-center text-slate-500">
                                    No categories found. {isAdmin && 'Add one above.'}
                                </td></tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-3 md:p-4 text-slate-500 text-center text-sm">{index + 1}</td>
                                        <td className="p-3 md:p-4 text-slate-200 font-medium text-sm md:text-base">{category.name}</td>
                                        {isAdmin && (
                                            <td className="p-3 md:p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => handleEditCategory(category)} disabled={actionLoading}
                                                        className="p-2 text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"
                                                        title="Edit Category">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                       
                                                        onClick={() => handleDeleteCategory(category)}
                                                        disabled={actionLoading}
                                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed"
                                                        title="Delete Category">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Categories;