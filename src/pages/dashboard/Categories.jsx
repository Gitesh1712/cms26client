import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/public/categories');
            // User specified response format: { code: "1000", message: "success", data: [...] }
            // or sometimes direct array depending on endpoint. 
            // Based on previous code in Home.jsx: const categoriesData = catResponse?.data || [];
            // Let's assume response.data is the array based on user prompt.
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
            // Generate ID from name: lowercase, replace spaces with hyphens
            const id = newCategory.toLowerCase().trim().replace(/[\s]+/g, '-');

            // Endpoint: /add
            let token = sessionStorage.getItem('token');
            await api.post('/categories/add', { id, name: newCategory }, { Authorization: `Bearer ${token}` });
            setNewCategory('');
            await fetchCategories(); // Refresh list
        } catch (err) {
            console.error("Failed to add category:", err);
            alert(err.data.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        setActionLoading(true);
        try {
            // Endpoint: /:id
            let token = sessionStorage.getItem('token');
            await api.delete(`/categories/${id}`, { Authorization: `Bearer ${token}` });
            await fetchCategories(); // Refresh list
        } catch (err) {
            console.error("Failed to delete category:", err);
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-white">Categories</h2>
            </div>

            {/* Add Category Section */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Category Name"
                        className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                    />
                    <button
                        type="submit"
                        disabled={!newCategory.trim() || actionLoading}
                        className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                        Add
                    </button>
                </form>
            </div>

            {/* Categories Table */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[300px]">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-3 md:p-4 text-slate-400 font-medium w-12 md:w-16 text-center text-xs md:text-sm">#</th>
                                <th className="p-3 md:p-4 text-slate-400 font-medium text-xs md:text-sm">Name</th>
                                <th className="p-3 md:p-4 text-slate-400 font-medium w-20 md:w-24 text-right text-xs md:text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" /> Loading categories...
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-red-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <AlertCircle size={20} /> {error}
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-500">
                                        No categories found. Add one above.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-3 md:p-4 text-slate-500 text-center text-sm">{index + 1}</td>
                                        <td className="p-3 md:p-4 text-slate-200 font-medium text-sm md:text-base">{category.name}</td>
                                        <td className="p-3 md:p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                                                title="Delete Category"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
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
