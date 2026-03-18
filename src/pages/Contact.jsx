import { useState, useEffect } from'react';
import { Send, MapPin, MessageSquare, Loader2, CheckCircle, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { api } from '../services/api';
import SEO from '../components/SEO';

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
      <div className="min-h-screen overflow-x-hidden">
          <SEO 
            title="Contact Us - Get in Touch"
            description="Have a question or want to collaborate? Get in touch with NoNoiseStories. We'd love to hear from you."
            image="/logo.png"
            type="website"
          />
         <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

                .ct-display { font-family: 'Playfair Display', serif; }
                .ct-body { font-family: 'DM Sans', sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-16px) rotate(2deg); }
                }
                @keyframes pulseSoft {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }

                .ct-fade-up   { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) both; }
                .ct-fade-up-1 { animation: fadeUp 0.9s 0.15s cubic-bezier(.22,1,.36,1) both; }
                .ct-fade-up-2 { animation: fadeUp 0.9s 0.3s  cubic-bezier(.22,1,.36,1) both; }
                .ct-fade-up-3 { animation: fadeUp 0.9s 0.45s cubic-bezier(.22,1,.36,1) both; }
                .ct-fade-in   { animation: fadeIn 1.2s 0.3s both; }
                .float-slow   { animation: floatSlow 8s ease-in-out infinite; }
                .pulse-soft   { animation: pulseSoft 4s ease-in-out infinite; }

                .text-stroke-ct {
                    -webkit-text-stroke: 1.5px rgba(255,180,50,0.5);
                    color: transparent;
                }

                .card-shine {
                    position: relative;
                    overflow: hidden;
                }
                .card-shine::before {
                    content: '';
                    position: absolute;
                    top: -100%; left: -100%;
                    width: 60%; height: 200%;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,204,102,0.05) 50%, transparent 60%);
                    transition: all 0.6s;
                    pointer-events: none;
                }
                .card-shine:hover::before { top: -100%; left: 140%; }

                .input-field {
                    width: 100%;
                    background: rgba(10, 8, 4, 0.85);
                    border: 1px solid rgba(255,180,50,0.15);
                    border-radius: 12px;
                    padding: 14px 18px;
                    color: #f1f5f9;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 400;
                    outline: none;
                    transition: all 0.3s;
                }
                .input-field::placeholder { color: rgba(148,163,184,0.5); }
                .input-field:focus {
                    border-color: rgba(255,122,24,0.6);
                    box-shadow: 0 0 0 3px rgba(255,122,24,0.1);
                    background: rgba(20,12,4,0.9);
                }
                select.input-field option { 
                    background: #0f0a04; 
                    color: #f1f5f9; 
                }

                .grain-ct::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    opacity: 0.4;
                }

                /* Info card label */
                .info-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.65rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #f59e0b;
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                /* Info card value */
                .info-value {
                    font-family: 'Playfair Display', serif;
                    font-weight: 700;
                    color: #ffffff;
                    font-size: 1rem;
                    margin-bottom: 2px;
                }

                /* Info card desc */
                .info-desc {
                    font-family: 'DM Sans', sans-serif;
                    color: #94a3b8;
                    font-size: 0.78rem;
                    font-weight: 300;
                }

                /* Tag pills */
                .tag-pill {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.75rem;
                    padding: 6px 14px;
                    border-radius: 9999px;
                    border: 1px solid rgba(255,180,50,0.2);
                    color: #cbd5e1;
                    background: rgba(255,255,255,0.03);
                    transition: all 0.3s;
                    cursor: default;
                }
                .tag-pill:hover {
                    border-color: rgba(255,122,24,0.5);
                    color: #fbbf24;
                    background: rgba(255,122,24,0.06);
                }

                /* Form label */
                .form-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.7rem;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: #fbbf24;
                    font-weight: 500;
                    display: block;
                    margin-bottom: 8px;
                }

                /* Section label */
                .section-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.7rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #fb923c;
                    font-weight: 500;
                }

                /* Divider text */
                .divider-text {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.7rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: white;
                }

                /* We handle label */
                .handle-label {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.65rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    font-weight: 500;
                    margin-bottom: 16px;
                }
            `}</style>

            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-20 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden grain-ct">

                {/* Glow blobs */}
                <div className="absolute top-10 right-0 w-[480px] h-[480px] rounded-full pointer-events-none pulse-soft"
                    style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.12) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-10 left-10 w-[320px] h-[320px] rounded-full pointer-events-none pulse-soft"
                    style={{ background: 'radial-gradient(circle, rgba(255,204,102,0.09) 0%, transparent 70%)', animationDelay: '2s' }} />

                {/* Big "04" watermark */}
                <div className="absolute right-6 md:right-16 top-16 select-none pointer-events-none ct-fade-in">
                    <span className="ct-display font-black text-stroke-ct float-slow inline-block"
                        style={{ fontSize: 'clamp(6rem, 18vw, 14rem)', lineHeight: 0.85, letterSpacing: '-0.04em' }}>
                        04
                    </span>
                </div>

                {/* Badge */}
                <div className="ct-fade-up mb-6">
                    <span className="ct-body inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-orange-400 border border-orange-500/30 bg-orange-500/10 px-4 py-2 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" style={{ animation: 'pulseSoft 2s infinite' }} />
                        Get In Touch
                    </span>
                </div>

                {/* Heading */}
                <div className="ct-fade-up-1 max-w-3xl mb-4">
                    <h1 className="ct-display font-black text-white leading-none"
                        style={{ fontSize: 'clamp(3.2rem, 9vw, 8rem)', letterSpacing: '-0.03em' }}>
                        Let's
                        <br />
                        <em className="italic" style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Talk
                        </em>
                    </h1>
                </div>

                {/* Divider */}
                <div className="ct-fade-up-2 flex items-center gap-6 mt-8 mb-6">
                    <div className="h-px max-w-xs flex-1"
                        style={{ background: 'linear-gradient(to right, rgba(255,122,24,0.7), transparent)' }} />
                    <span className="divider-text">We'd love to hear from you</span>
                </div>

                {/* Subtext */}
                <p className="ct-fade-up-3 ct-body text-slate-300 text-base md:text-lg max-w-xl leading-relaxed" style={{ fontWeight: 300 }}>
                    Whether you have a question, want to collaborate, or just say hi —
                    <span className="text-orange-300 font-medium"> we're always listening.</span>
                </p>
            </section>

            {/* ===== FORM + INFO SECTION ===== */}
            <section className="px-6 md:px-12 lg:px-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

                    {/* ---- Left Info Cards ---- */}
                    <div className="lg:col-span-4 space-y-8">

                        {[
                            {
                                icon: <Mail size={22} />,
                                label: "Email us",
                                value: "support@gmail.com",
                                desc: "We reply within 24 hours"
                            },
                            {
                                icon: <MapPin size={22} />,
                                label: "Visit us",
                                value: "Urbtech Trade Centre",
                                desc: "Sector 132, Noida"
                            },
                            {
                                icon: <MessageSquare size={22} />,
                                label: "Live chat",
                                value: "Available on site",
                                desc: "Mon–Fri, 10am–6pm"
                            }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="group flex gap-5 p-5 rounded-2xl border transition-all duration-400 card-shine relative"
                                style={{
                                    background: 'rgba(15,10,3,0.75)',
                                    borderColor: 'rgba(255,180,50,0.12)'
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,122,24,0.35)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,180,50,0.12)'}
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                                    style={{ background: 'radial-gradient(circle at 20% 50%, rgba(255,122,24,0.07), transparent 70%)' }} />

                                {/* Icon */}
                                <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-900 mt-0.5 group-hover:scale-110 transition-transform duration-300"
                                    style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                    {item.icon}
                                </div>

                                {/* Text */}
                                <div>
                                    <p className="info-label">{item.label}</p>
                                    <p className="info-value">{item.value}</p>
                                    <p className="info-desc">{item.desc}</p>
                                </div>

                                {/* Bottom line */}
                                <div className="absolute bottom-4 right-5 w-0 group-hover:w-6 h-px transition-all duration-300"
                                    style={{ background: 'linear-gradient(to right, #FF7A18, #FFCC66)' }} />
                            </div>
                        ))}

                        {/* Tags */}
                        <div className="pt-4">
                            <p className="handle-label">We handle</p>
                            <div className="flex flex-wrap gap-2">
                                {['General', 'Partnership', 'Support', 'Collaboration', 'Press'].map((tag) => (
                                    <span key={tag} className="tag-pill">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ---- Right Form ---- */}
                    <div className="lg:col-span-8">
                        <div className="relative rounded-3xl p-8 md:p-10 border card-shine"
                            style={{
                                background: 'linear-gradient(135deg, rgba(18,10,3,0.97), rgba(12,12,18,0.98))',
                                borderColor: 'rgba(255,180,50,0.15)'
                            }}>

                            {/* Top border line */}
                            <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
                                style={{ background: 'linear-gradient(to right, transparent, rgba(255,204,102,0.4), transparent)' }} />

                            {/* Section label */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-8 h-px bg-orange-500" />
                                <span className="section-label">Send a message</span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Status */}
                                {status && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ct-body
                                        ${status === 'success'
                                            ? 'bg-green-500/10 text-green-300 border-green-500/25'
                                            : 'bg-red-500/10 text-red-300 border-red-500/25'}`}>
                                        {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                        {statusMessage}
                                    </div>
                                )}

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your name"
                                        className="input-field"
                                    />
                                </div>

                                {/* Email + Mobile */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="form-label">Mobile</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            required
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="+91 00000 00000"
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {/* Inquiry Type */}
                                <div className="space-y-2">
                                    <label className="form-label">Inquiry Type</label>
                                    <div className="relative">
                                        <select
                                            name="inquiryType"
                                            value={formData.inquiryType}
                                            onChange={handleChange}
                                            className="input-field appearance-none cursor-pointer pr-10"
                                        >
                                            <option value="General">General</option>
                                            <option value="Partnership">Partnership</option>
                                            <option value="Support">Support</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        name="message"
                                        rows="5"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Tell us what's on your mind..."
                                        className="input-field resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full flex items-center justify-between px-8 py-4 rounded-2xl ct-body font-semibold text-slate-900 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    style={{
                                        background: 'linear-gradient(135deg, #FFCC66, #FF7A18)',
                                        boxShadow: '0 0 40px rgba(255,122,24,0.25)'
                                    }}
                                >
                                    <span className="flex items-center gap-3 font-bold text-slate-900">
                                        {loading
                                            ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                            : <><Send size={18} /> Send Message</>
                                        }
                                    </span>
                                    {!loading && (
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-slate-900" />
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;