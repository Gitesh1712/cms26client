import { useEffect, useRef, useState } from'react';
import { BookOpen, Users, Target, Heart, Lightbulb, Award, Globe, TrendingUp, MessageSquare, ArrowRight, Play, Star, Filter, CheckCircle, Eye } from 'lucide-react';
import { Link } from'react-router-dom';
import SEO from '../components/SEO';

const About = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        { icon: <BookOpen size={28} />, title: "Explainers That Make Sense", description: "Complex topics, simplified in minutes. No jargon, no fluff — just clarity." },
        { icon: <Users size={28} />, title: "On-Ground Storytelling", description: "Real voices, real impact. We go where the stories actually are." },
        { icon: <Target size={28} />, title: "High-Retention Video Content", description: "Built for today's attention spans. Every second earns the next." },
        { icon: <CheckCircle size={28} />, title: "Fact-First Narratives", description: "Accuracy over assumptions. We verify before we publish, always." },
        { icon: <Filter size={28} />, title: "Cut Through the Noise", description: "We filter out misinformation and deliver only what actually matters." },
        { icon: <Eye size={28} />, title: "Credibility is Non-Negotiable", description: "Trust is earned story by story. We don't cut corners on accuracy." }
    ];

    const stats = [
        { number: "500+", label: "Stories Published" },
        { number: "50K+", label: "Monthly Readers" },
        { number: "25+", label: "Categories" },
        { number: "100%", label: "Fact-First" }
    ];

    return (
      <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'Georgia', serif" }}>
          <SEO 
          title="About Us - Our Story & Mission"
            description="No Noise Stories is a digital storytelling platform built to simplify complex news, cut through misinformation, and deliver clear, impactful narratives that people can trust."
            image="/logo.png"
            type="website"
          />
         <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

                .about-display { font-family: 'Playfair Display', serif; }
                .about-body { font-family: 'DM Sans', sans-serif; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes lineGrow {
                    from { width: 0; }
                    to { width: 100%; }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(3deg); }
                }
                @keyframes pulseSoft {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                @keyframes marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
                @keyframes countUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .anim-fade-up { animation: fadeUp 0.9s cubic-bezier(.22,1,.36,1) both; }
                .anim-fade-up-1 { animation: fadeUp 0.9s 0.1s cubic-bezier(.22,1,.36,1) both; }
                .anim-fade-up-2 { animation: fadeUp 0.9s 0.25s cubic-bezier(.22,1,.36,1) both; }
                .anim-fade-up-3 { animation: fadeUp 0.9s 0.4s cubic-bezier(.22,1,.36,1) both; }
                .anim-fade-up-4 { animation: fadeUp 0.9s 0.55s cubic-bezier(.22,1,.36,1) both; }
                .anim-fade-in { animation: fadeIn 1.2s 0.3s both; }
                .float-slow { animation: floatSlow 8s ease-in-out infinite; }
                .pulse-soft { animation: pulseSoft 4s ease-in-out infinite; }
                .marquee-inner { animation: marquee 28s linear infinite; }
                .stat-anim { animation: countUp 0.8s cubic-bezier(.22,1,.36,1) both; }

                .text-stroke {
                    -webkit-text-stroke: 1px rgba(255,180,50,0.4);
                    color: transparent;
                }
                .card-shine {
                    position: relative;
                    overflow: hidden;
                }
                .card-shine::before {
                    content: '';
                    position: absolute;
                    top: -100%;
                    left: -100%;
                    width: 60%;
                    height: 200%;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,204,102,0.06) 50%, transparent 60%);
                    transition: all 0.6s;
                    pointer-events: none;
                }
                .card-shine:hover::before {
                    top: -100%;
                    left: 140%;
                }
                .diagonal-cut {
                    clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%);
                }
                .diagonal-cut-rev {
                    clip-path: polygon(0 12%, 100% 0, 100% 100%, 0 100%);
                }
                .number-big {
                    font-size: clamp(5rem, 15vw, 12rem);
                    line-height: 0.85;
                    letter-spacing: -0.04em;
                }
                .hero-title {
                    font-size: clamp(3.5rem, 10vw, 9rem);
                    line-height: 0.9;
                    letter-spacing: -0.03em;
                }
                .marquee-text {
                    font-size: clamp(1.2rem, 3vw, 2rem);
                    letter-spacing: 0.08em;
                }
                .grain-overlay::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    opacity: 0.5;
                }

                /* Gradient text utility */
                .grad-text {
                    background: linear-gradient(135deg, rgb(255, 204, 102), rgb(255, 122, 24));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>

           
            <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-16 pb-0 overflow-hidden grain-overlay">

                <div className="absolute top-20 right-10 w-[500px] h-[500px] rounded-full pulse-soft pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,154,24,0.12) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full pulse-soft pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(255,204,102,0.08) 0%, transparent 70%)', animationDelay: '2s' }} />

                <div className="absolute right-6 md:right-16 top-24 md:top-32 select-none pointer-events-none anim-fade-in">
                    <span className="number-big about-display text-stroke float-slow inline-block">01</span>
                </div>

                <div className="anim-fade-up mb-6 about-body">
                    <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase text-orange-400 border border-orange-500/20 bg-orange-500/8 px-4 py-2 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" style={{ animation: 'pulseSoft 2s infinite' }}></span>
                        About No Noise Stories
                    </span>
                </div>

                <div className="max-w-5xl anim-fade-up-1">
                    <h1 className="hero-title about-display font-black text-white mb-0 leading-none">
                        In a World
                        <br />
                        <em className="italic" style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Full of Noise
                        </em>
                        <br />
                        We Focus.
                    </h1>
                </div>

                <div className="mt-10 mb-8 flex items-center gap-6 anim-fade-up-2">
                    <div className="h-px flex-1 max-w-xs" style={{ background: 'linear-gradient(to right, rgba(255,122,24,0.6), transparent)' }} />
                   
                    <span className="about-body text-xs tracking-widest uppercase grad-text">Est. 2026</span>
                </div>

                <p className="about-body max-w-2xl text-white text-base md:text-lg leading-relaxed anim-fade-up-3" style={{ fontWeight: 300 }}>
                    No Noise Stories is a digital storytelling platform built to simplify complex news,
                    cut through misinformation, and deliver clear, impactful narratives that people can trust.
                    <span className="text-orange-300 font-medium"> We don't chase virality. We chase clarity.</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-10 anim-fade-up-4">
                    <Link to="/" className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full font-semibold text-slate-900 about-body text-sm transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', boxShadow: '0 0 40px rgba(255,122,24,0.3)' }}>
                        Start Reading
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/contact" className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full font-semibold text-white about-body text-sm border border-white/10 hover:border-orange-500/40 hover:text-white transition-all">
                        <MessageSquare size={15} />
                        Get in Touch
                    </Link>
                </div>

                <div className="mt-20 mb-8 flex items-center gap-3 about-body anim-fade-in">
                    <div className="flex flex-col gap-1">
                        <div className="w-px h-8 mx-auto" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,122,24,0.6))' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mx-auto" />
                    </div>
                   
                    <span className="about-body text-xs tracking-[0.2em] uppercase grad-text">Scroll to explore</span>
                </div>
            </section>

          
            <div className="overflow-hidden border-y border-white/5 py-4" style={{ background: 'rgba(255,122,24,0.04)' }}>
                <div className="flex marquee-inner whitespace-nowrap">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-0 shrink-0">
                            {['Clarity', 'Truth', 'Simplicity', 'No Hype', 'Fact-First', 'Real Stories', 'Cut the Noise', 'Credibility', 'Impact', 'Awareness'].map((word, j) => (
                                <span key={j} className="marquee-text about-display font-bold inline-flex items-center gap-6 px-8"
                                    style={{ background: 'linear-gradient(135deg, rgb(255,204,102), rgb(255,122,24))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    {word}
                                    <span className="text-orange-500" style={{ fontSize: '0.5em', WebkitTextFillColor: 'initial' }}>◆</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            
            <section className="relative py-24 overflow-hidden" style={{ background: 'rgba(15,15,20,0.8)' }}>
                <div className="px-6 md:px-12 lg:px-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-0 items-center">

                        <div className="lg:col-span-7 lg:pr-20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-8 h-px bg-orange-500" />
                                <span className="about-body text-xs tracking-[0.25em] uppercase text-orange-400">Why We Exist</span>
                            </div>

                            <h2 className="about-display font-black text-white mb-8 leading-none"
                                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}>
                                Information Today<br />
                               
                                <em className="italic grad-text">Is Broken.</em><br />
                                We're Fixing It.
                            </h2>

                            
                            <p className="about-body text-white text-base md:text-lg leading-relaxed mb-8 max-w-xl" style={{ fontWeight: 300 }}>
                                Because information today is either too complicated, too biased, or too shallow.
                                We exist to fix that — delivering news and stories that are clear, credible, and meaningful.
                            </p>

                            <div className="space-y-5">
                                {[
                                    "Too complicated — we simplify without dumbing down",
                                    "Too biased — we let facts lead, not agendas",
                                    "Too shallow — we go deeper on what actually matters",
                                    "Too noisy — we cut through and give you the signal"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                            style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                            <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    
                                        <span className="about-body text-white group-hover:grad-text transition-colors">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto max-w-sm">
                                <div className="absolute -top-4 -right-4 w-full h-full rounded-3xl border border-orange-500/10"
                                    style={{ background: 'rgba(255,122,24,0.04)' }} />
                                <div className="relative rounded-3xl p-8 border border-white/8 card-shine"
                                    style={{ background: 'linear-gradient(135deg, rgba(30,30,40,0.9), rgba(20,20,30,0.9))' }}>
                                    <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl"
                                        style={{ background: 'linear-gradient(to right, transparent, rgba(255,204,102,0.3), transparent)' }} />

                                    <div className="aspect-square rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, rgba(255,204,102,0.1), rgba(255,122,24,0.1))' }}>
                                        <div className="absolute inset-0 opacity-20"
                                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,122,24,0.1) 0px, rgba(255,122,24,0.1) 1px, transparent 1px, transparent 20px)' }} />
                                        <Filter size={72} className="text-orange-400 relative z-10 float-slow" />
                                    </div>

                                    <p className="about-display text-xl font-bold text-white mb-2">Signal Over Noise</p>
                                   
                                    <p className="about-body grad-text text-sm" style={{ fontWeight: 300 }}>
                                        We filter the flood so you only get what actually matters
                                    </p>

                                    <div className="mt-6 flex items-center gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} className="text-orange-400 fill-orange-400" />
                                        ))}
                                        <span className="about-body grad-text text-xs ml-2">50K+ readers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-24 px-6 md:px-12 lg:px-20">
                <div className="flex items-end justify-between mb-16 flex-wrap gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-px bg-orange-500" />
                            <span className="about-body text-xs tracking-[0.25em] uppercase text-orange-400">What We Do</span>
                        </div>
                        <h2 className="about-display font-black text-white leading-none"
                            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}>
                            How We Cut<br />
                            <em className="italic text-orange-400">Through the Noise</em>
                        </h2>
                    </div>
                    <p className="about-body text-white max-w-xs text-sm leading-relaxed" style={{ fontWeight: 300 }}>
                        We're not just another content platform — here's how we actually deliver on our promise.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden">
                    {features.map((feature, index) => (
                        <div key={index} className="group p-8 md:p-10 bg-slate-950 hover:bg-slate-900/80 transition-all duration-500 card-shine relative">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ background: 'radial-gradient(circle at 20% 20%, rgba(255,122,24,0.06), transparent 60%)' }} />
                            <div className="about-display font-black mb-6 select-none grad-text"
                                style={{ fontSize: '3.5rem', lineHeight: 1, letterSpacing: '-0.04em', opacity: 0.35 }}>
                                {String(index + 1).padStart(2, '0')}
                            </div>

                            <div className="w-12 h-12 rounded-2xl mb-5 flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform duration-300"
                                style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                {feature.icon}
                            </div>

                            <h3 className="about-display text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="about-body text-white leading-relaxed text-sm" style={{ fontWeight: 300 }}>{feature.description}</p>

                            <div className="mt-6 w-0 group-hover:w-8 h-px transition-all duration-300"
                                style={{ background: 'linear-gradient(to right, #FF7A18, #FFCC66)' }} />
                        </div>
                    ))}
                </div>
            </section>
            <section className="relative py-32 px-6 md:px-12 lg:px-20 overflow-hidden" style={{ background: 'rgba(10,10,15,0.9)' }}>
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.06) 0%, transparent 70%)' }} />
                </div>

                <div className="relative max-w-5xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(255,122,24,0.5))' }} />
                        <span className="about-body text-xs tracking-[0.25em] uppercase text-orange-400">Our Vision</span>
                        <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(255,122,24,0.5))' }} />
                    </div>

                    <h2 className="about-display font-black text-white mb-8 leading-none"
                        style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}>
                        A Platform Where<br />
                        <em className="italic" style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Noise Doesn't Win
                        </em>
                    </h2>
                    <p className="about-body text-white text-lg md:text-xl leading-relaxed mb-16 max-w-3xl mx-auto" style={{ fontWeight: 300 }}>
                        We believe simplicity is powerful, credibility is non-negotiable,
                        and storytelling drives real awareness. That's what we're building toward — every single day.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden text-left">
                        {[
                            { icon: <BookOpen size={24} />, title: "News Is Clear", description: "Complex stories, simplified without losing the truth. You'll always understand what's happening and why it matters." },
                            { icon: <Users size={24} />, title: "Stories Are Meaningful", description: "Every piece we publish earns its place. No filler, no fluff — just content that informs, challenges, and connects." },
                            { icon: <Filter size={24} />, title: "Noise Doesn't Win", description: "Misinformation loses when clarity wins. We're building a platform where facts and good storytelling always come first." }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 bg-slate-950 hover:bg-slate-900/70 transition-all duration-400 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: 'linear-gradient(to right, transparent, rgba(255,122,24,0.4), transparent)' }} />
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 mb-5"
                                    style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)' }}>
                                    {item.icon}
                                </div>
                                <h3 className="about-display font-bold text-white text-lg mb-2">{item.title}</h3>
                                <p className="about-body text-white text-sm leading-relaxed" style={{ fontWeight: 300 }}>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-24 px-6 md:px-12 lg:px-20">
                <div className="relative rounded-3xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1200, #1a0a00)' }}>

                    <div className="absolute inset-0 pointer-events-none"
                        style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,122,24,0.04) 0px, rgba(255,122,24,0.04) 1px, transparent 1px, transparent 80px), repeating-linear-gradient(0deg, rgba(255,122,24,0.04) 0px, rgba(255,122,24,0.04) 1px, transparent 1px, transparent 80px)' }} />

                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255,122,24,0.2), transparent 70%)' }} />
                    <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(255,204,102,0.1), transparent 70%)' }} />

                    <div className="relative z-10 p-10 md:p-16 lg:p-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <span className="about-body text-xs tracking-[0.25em] uppercase text-orange-400 mb-6 block">
                                    Ready to Read Differently?
                                </span>
                                <h2 className="about-display font-black text-white leading-none mb-6"
                                    style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}>
                                    Join the<br />
                                    <em className="italic" style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        Clarity
                                    </em>
                                </h2>
                                <p className="about-body text-white text-base leading-relaxed max-w-md" style={{ fontWeight: 300 }}>
                                    Join thousands of readers who've chosen clarity over noise.
                                    Start your journey into narratives that inform, challenge, and actually make sense.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4">
                                <Link to="/" className="group flex-1 flex items-center justify-between px-8 py-5 rounded-2xl font-semibold text-slate-900 about-body transition-all hover:scale-105 active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #FFCC66, #FF7A18)', boxShadow: '0 0 40px rgba(255,122,24,0.25)' }}>
                                    <span className="flex items-center gap-3">
                                        <BookOpen size={20} />
                                        Start Reading
                                    </span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/contact" className="group flex-1 flex items-center justify-between px-8 py-5 rounded-2xl font-semibold text-white about-body border border-white/10 hover:border-orange-500/30 hover:text-white transition-all hover:scale-105">
                                    <span className="flex items-center gap-3">
                                        <MessageSquare size={20} />
                                        Get in Touch
                                    </span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;