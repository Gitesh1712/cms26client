import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, AlertCircle, Pencil, X, Check, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import Swal from 'sweetalert2';

const dispatchCategoriesUpdated = () => {
    window.dispatchEvent(new CustomEvent('categoriesUpdated'));
};


const generateId = (name) =>
    name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');


const EditModal = ({ category, onClose, onSave, saving }) => {
    const [name,       setName]       = useState(category.name);
    const [id,         setId]         = useState(category.id);
    const [autoId,     setAutoId]     = useState(true);   
    const [updatePosts, setUpdatePosts] = useState(false); 

    const idChanged   = id   !== category.id;
    const nameChanged = name !== category.name;
    const hasChanges  = nameChanged || idChanged;

    const handleNameChange = (val) => {
        setName(val);
        if (autoId) setId(generateId(val));
    };

    const handleIdChange = (val) => {
      
        const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setId(clean);
        setAutoId(false); 
    };

    const resetIdToAuto = () => {
        setId(generateId(name));
        setAutoId(true);
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        if (!id.trim())   return;
        onSave({ name: name.trim(), id: id.trim(), updatePosts });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl"
                style={{ background: '#0f172a' }}>

               
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                    <h3 className="text-white font-semibold text-lg">Edit Category</h3>
                    <button onClick={onClose} disabled={saving}
                        className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                        <X size={18} />
                    </button>
                </div>

            
                <div className="px-6 py-5 space-y-5">

                
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. NNS Originals"
                            className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition-all placeholder:text-slate-600"
                        />
                        <p className="text-xs text-slate-600 mt-1">Website pe yahi naam dikhega</p>
                    </div>

                  
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Category ID
                                {idChanged && (
                                    <span className="ml-2 text-orange-400 normal-case font-normal">
                                        (changed)
                                    </span>
                                )}
                            </label>
                            {!autoId && (
                                <button onClick={resetIdToAuto}
                                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-400 transition-colors">
                                    <RefreshCw size={11} /> Auto
                                </button>
                            )}
                        </div>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => handleIdChange(e.target.value)}
                            placeholder="e.g. nns-originals"
                            className="w-full bg-slate-950/60 border border-slate-700 rounded-xl py-3 px-4 text-sm font-mono transition-all placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                            style={{
                                color: idChanged ? '#fb923c' : '#94a3b8',
                                borderColor: idChanged ? 'rgba(251,146,60,0.4)' : undefined
                            }}
                        />
                        <p className="text-xs text-slate-600 mt-1">
                            Lowercase letters, numbers aur hyphens only · Posts mein store hoti hai
                        </p>
                    </div>

                 
                    {idChanged && (
                        <div className="rounded-xl border p-4 space-y-3"
                            style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
                            <p className="text-xs text-orange-300 leading-relaxed">
                                ⚠️ ID badal rahi hai: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-orange-400">{category.id}</code>
                                {' → '}
                                <code className="bg-slate-800 px-1.5 py-0.5 rounded text-orange-400">{id}</code>
                            </p>

                          
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative mt-0.5 flex-shrink-0">
                                    <input type="checkbox" className="sr-only"
                                        checked={updatePosts}
                                        onChange={(e) => setUpdatePosts(e.target.checked)} />
                                    <div className="w-9 h-5 rounded-full transition-colors"
                                        style={{ background: updatePosts ? '#fb923c' : '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div className="w-3.5 h-3.5 bg-white rounded-full shadow absolute top-[3px] transition-transform"
                                            style={{ left: updatePosts ? '18px' : '3px' }} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-300">
                                        Saari posts bhi update karo
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        ON karo toh is category ki saari posts naye ID se linked ho jaayengi
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}

                  
                    {!hasChanges && (
                        <p className="text-xs text-slate-600 text-center py-1">
                            Kuch bhi change nahi hua abhi
                        </p>
                    )}
                </div>

              
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5">
                    <button onClick={onClose} disabled={saving}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!hasChanges || saving || !name.trim() || !id.trim()}
                        className="px-5 py-2 rounded-xl font-semibold text-sm text-slate-900 flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                        {saving ? (
                            <><Loader2 size={15} className="animate-spin" /> Saving...</>
                        ) : (
                            <><Check size={15} /> Save Changes</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


const Categories = () => {
    const [categories,   setCategories]   = useState([]);
    const [newName,      setNewName]      = useState('');
    const [newId,        setNewId]        = useState('');
    const [autoId,       setAutoId]       = useState(true);
    const [loading,      setLoading]      = useState(true);
    const [actionLoading,setActionLoading]= useState(false);
    const [error,        setError]        = useState(null);
    const [isAdmin,      setIsAdmin]      = useState(false);
    const [editTarget,   setEditTarget]   = useState(null); 
    const [editSaving,   setEditSaving]   = useState(false);

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

   
    const handleNewNameChange = (val) => {
        setNewName(val);
        if (autoId) setNewId(generateId(val));
    };

    const handleNewIdChange = (val) => {
        const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setNewId(clean);
        setAutoId(false);
    };

    const resetAddIdToAuto = () => {
        setNewId(generateId(newName));
        setAutoId(true);
    };

   
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !newId.trim()) return;
        setActionLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            await api.post(
                '/categories/add',
                { id: newId.trim(), name: newName.trim() },
                { Authorization: `Bearer ${token}` }
            );
            setNewName('');
            setNewId('');
            setAutoId(true);
            await fetchCategories();
            dispatchCategoriesUpdated();
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Error',
                text: err?.message || err?.data?.message || 'Failed to add category',
                confirmButtonColor: '#FF7A18', background: '#0f172a', color: '#e2e8f0'
            });
        } finally {
            setActionLoading(false);
        }
    };

    
    const handleSaveEdit = async ({ name, id: newCatId, updatePosts }) => {
        if (!editTarget) return;
        setEditSaving(true);
        try {
            const token = sessionStorage.getItem('token');
            await api.put(
                `/categories/${editTarget.id}`,
                { id: newCatId, name, updatePosts },
                { Authorization: `Bearer ${token}` }
            );
            setEditTarget(null);
            await fetchCategories();
            dispatchCategoriesUpdated();

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                html: newCatId !== editTarget.id && updatePosts
                    ? `<p style="color:#94a3b8">Category aur saari related posts update ho gayi hain.</p>`
                    : `<p style="color:#94a3b8">Category successfully updated.</p>`,
                confirmButtonColor: '#FF7A18',
                background: '#0f172a',
                color: '#e2e8f0',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire({
                icon: 'error', title: 'Error',
                text: err?.message || 'Failed to update category',
                confirmButtonColor: '#FF7A18', background: '#0f172a', color: '#e2e8f0'
            });
        } finally {
            setEditSaving(false);
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
                    html: `<p style="color:#94a3b8">Category <strong style="color:#f1f5f9">"${category.name}"</strong> mein <strong style="color:#fb923c">${postsInCategory.length} post${postsInCategory.length > 1 ? 's' : ''}</strong> hain.</p>
                           <p style="color:#94a3b8;margin-top:8px">Pehle un posts ko dusri category mein move ya delete karo.</p>`,
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
                text: err?.message || 'Failed to delete category',
                confirmButtonColor: '#FF7A18', background: '#0f172a', color: '#e2e8f0'
            });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
           
            {editTarget && (
                <EditModal
                    category={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSave={handleSaveEdit}
                    saving={editSaving}
                />
            )}

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold text-white">Categories</h2>
                </div>

              
                {isAdmin && (
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 md:p-6">
                        <h3 className="text-lg font-semibold text-slate-200 mb-4">Add New Category</h3>
                        <form onSubmit={handleAddCategory} className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                             
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => handleNewNameChange(e.target.value)}
                                        placeholder="Category Name  (e.g. NNS Originals)"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600 text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newName.trim() || !newId.trim() || actionLoading}
                                    className="px-6 py-3 bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Add
                                </button>
                            </div>

                         
                            {newName.trim() && (
                                <div className="flex items-center gap-2 px-1">
                                    <span className="text-xs text-slate-500">ID:</span>
                                    <div className="flex items-center gap-1.5 flex-1">
                                        <input
                                            type="text"
                                            value={newId}
                                            onChange={(e) => handleNewIdChange(e.target.value)}
                                            className="flex-1 bg-slate-950/40 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-mono text-orange-400 focus:outline-none focus:border-orange-500/40 transition-all max-w-xs"
                                        />
                                        {!autoId && (
                                            <button type="button" onClick={resetAddIdToAuto}
                                                className="text-xs text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                                                <RefreshCw size={10} /> Auto
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-600">Posts mein yahi store hoga</span>
                                </div>
                            )}
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
                                    <th className="p-3 md:p-4 text-slate-400 font-medium text-xs md:text-sm hidden sm:table-cell">ID</th>
                                    {isAdmin && (
                                        <th className="p-3 md:p-4 text-slate-400 font-medium w-28 md:w-32 text-right text-xs md:text-sm">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-slate-500">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={20} className="animate-spin" /> Loading categories...
                                            </div>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-red-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <AlertCircle size={20} /> {error}
                                            </div>
                                        </td>
                                    </tr>
                                ) : categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-slate-500">
                                            No categories found. {isAdmin && 'Add one above.'}
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((category, index) => (
                                        <tr key={category.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-3 md:p-4 text-slate-500 text-center text-sm">{index + 1}</td>
                                            <td className="p-3 md:p-4 text-slate-200 font-medium text-sm md:text-base">
                                                {category.name}
                                            </td>
                                            <td className="p-3 md:p-4 hidden sm:table-cell">
                                                <code className="text-xs px-2 py-1 rounded-md"
                                                    style={{ background: 'rgba(251,146,60,0.08)', color: '#fb923c' }}>
                                                    {category.id}
                                                </code>
                                            </td>
                                            {isAdmin && (
                                                <td className="p-3 md:p-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => setEditTarget(category)}
                                                            disabled={actionLoading}
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
        </>
    );
};

export default Categories;