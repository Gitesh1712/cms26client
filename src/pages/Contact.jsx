import { useState, useEffect } from 'react';
import { Send, MapPin, Phone, MessageSquare, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const Contact = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        inquiryType: 'General',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); 
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            await api.post('/public/leads/submit', formData);
            setStatus('success');
            setStatusMessage('Message sent successfully! We will get back to you soon.');
            setFormData({ name: '', email: '', mobile: '', inquiryType: 'General', message: '' });
        } catch (error) {
            console.error("Submission failed:", error);
            setStatus('error');
            setStatusMessage('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
            
                <div className="space-y-6 md:space-y-8 mt-0 md:mt-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] mb-4 md:mb-6">Let's Talk</h2>
                        <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                            Whether you have a question, want to collaborate, or just say hi — we’d love to hear from you.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { icon: <MessageSquare size={24} />, title: "Chat with us", info: "support@storyhub.com" },
                            { icon: <MapPin size={24} />, title: "Visit us", info: "Urbtech Trade Centre in Sector 132, Noida" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl border border-transparent hover:border-white/5 hover:bg-slate-800/30 transition-all duration-300">
                                <div className="p-3 bg-slate-800/80 rounded-xl text-orange-400 h-fit">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                                    <p className="text-orange-300 font-medium">{item.info}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

           
                <div className="relative bg-slate-900 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <p className="text-sm font-medium">{statusMessage}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                                placeholder="Your Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 ml-1">Mobile</label>
                                <input
                                    type="tel"
                                    name="mobile"
                                    required
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="Mobile Number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Inquiry Type</label>
                            <select
                                name="inquiryType"
                                value={formData.inquiryType}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="General" className="bg-slate-900">General</option>
                                <option value="Partnership" className="bg-slate-900">Partnership</option>
                                <option value="Support" className="bg-slate-900">Support</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Message</label>
                            <textarea
                                name="message"
                                rows="4"
                                required
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none placeholder:text-slate-600"
                                placeholder="Tell us about your project..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-orange-50 transition-colors duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>Processing <Loader2 size={18} className="animate-spin" /></>
                            ) : (
                                <>Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Contact;
