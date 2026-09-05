import { useEffect, useState } from 'react';
import { Shield, Eye, Mail, Phone, MapPin, FileText, Lock, UserCheck, Database, Bell, Share2, Cookie, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
    };

    const policySections = [
        {
            title: "1. Information We Collect",
            icon: <Database size={24} />,
            content: `We collect information to provide better services to our readers. The types of information we collect include:

Personal Information:
• Name and email address when you subscribe to our newsletter
• Contact information when you reach out to us
• Account information if you create a user account
• Comments and feedback you provide on our articles

Usage Information:
• Pages you visit on our website
• Time spent reading articles
• Device and browser information
• IP address and approximate location
• Referral sources (how you found us)

Content Interactions:
• Articles you like or share
• Videos you watch
• Categories you're interested in`
        },
        {
            title: "2. How We Use Your Information",
            icon: <Eye size={24} />,
            content: `We use the collected information for the following purposes:

To Provide Our Services:
• Deliver news articles and video content
• Send newsletters you've subscribed to
• Respond to your inquiries and feedback
• Improve our website and content

To Enhance User Experience:
• Personalize content recommendations
• Remember your preferences
• Analyze website traffic and usage patterns
• Troubleshoot technical issues

For Communication:
• Send important updates about our services
• Notify you about new features or content
• Respond to your comments and questions
• Conduct surveys to improve our services`
        },
        {
            title: "3. Cookies and Tracking Technologies",
            icon: <Cookie size={24} />,
            content: `We use cookies and similar tracking technologies to enhance your experience:

Essential Cookies:
• Keep you logged in to your account
• Remember your preferences
• Enable core website functionality

Analytics Cookies:
• Help us understand how visitors interact with our website
• Track which articles are most popular
• Measure the effectiveness of our content

Third-Party Cookies:
• YouTube cookies for embedded video content
• Social media cookies for sharing features
• Analytics services (Google Analytics) to understand user behavior

You can control cookies through your browser settings. However, disabling cookies may affect your experience on our website.`
        },
        {
            title: "4. Data Sharing and Disclosure",
            icon: <Share2 size={24} />,
            content: `We respect your privacy and do not sell your personal information. We may share data in the following circumstances:

Service Providers:
• Analytics providers to understand website usage
• Hosting providers to maintain our website
• Email service providers for newsletters
• Payment processors (if applicable)

Legal Requirements:
• When required by law or legal process
• To protect our rights and property
• To prevent fraud or security issues
• To comply with court orders or subpoenas

Business Transfers:
• In connection with a merger or acquisition
• If we sell our business or assets
• Your information would remain subject to this policy

We ensure all third parties have appropriate data protection measures in place.`
        },
        {
            title: "5. Data Security",
            icon: <Lock size={24} />,
            content: `We implement appropriate security measures to protect your personal information:

Technical Measures:
• SSL/TLS encryption for data transmission
• Secure server infrastructure
• Regular security updates and patches
• Access controls and authentication

Organizational Measures:
• Limited access to personal information
• Staff training on data protection
• Regular security audits
• Incident response procedures

Important Note:
While we strive to protect your personal information, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but continuously work to enhance our security measures.`
        },
        {
            title: "6. Your Rights and Choices",
            icon: <UserCheck size={24} />,
            content: `You have several rights regarding your personal information:

Access and Correction:
• Request access to your personal data
• Correct inaccurate information
• Update your preferences
• Download your data

Control and Deletion:
• Unsubscribe from newsletters at any time
• Delete your account
• Request deletion of your personal data
• Opt-out of marketing communications

Objection and Restriction:
• Object to processing of your data
• Request restriction of processing
• Withdraw consent at any time
• Lodge a complaint with authorities

To exercise these rights, contact us at the email provided below. We will respond within 30 days.`
        },
        {
            title: "7. Newsletter and Communications",
            icon: <Bell size={24} />,
            content: `When you subscribe to our newsletter:

What We Send:
• Daily or weekly news digests
• Breaking news alerts
• Feature stories and investigations
• Updates about our platform

How to Manage:
• Unsubscribe link in every email
• Update preferences in your account
• Contact us to modify subscriptions
• No penalty for unsubscribing

We respect your inbox and only send content you've agreed to receive. We never share your email with third parties for marketing purposes.`
        },
        {
            title: "8. Children's Privacy",
            icon: <Shield size={24} />,
            content: `Our content is intended for general audiences. We are committed to protecting children's privacy:

• We do not knowingly collect personal information from children under 13
• If we discover we have collected data from a child under 13, we will delete it immediately
• Parents who believe we have inadvertently collected such information should contact us
• We encourage parents to supervise their children's online activities

Our website is not specifically designed for or targeted at children under 13.`
        },
        {
            title: "9. Third-Party Links",
            icon: <Share2 size={24} />,
            content: `Our website may contain links to external sites:

• We are not responsible for the privacy practices of other websites
• We encourage you to read the privacy policies of every site you visit
• Links do not imply endorsement of the linked sites
• External sites have their own terms and privacy policies

This privacy policy applies only to information collected on our website.`
        },
        {
            title: "10. Changes to This Policy",
            icon: <FileText size={24} />,
            content: `We may update this Privacy Policy from time to time:

• We will notify users of material changes via email or website notice
• Changes take effect immediately upon posting
• Your continued use of the site constitutes acceptance of changes
• We encourage you to review this policy periodically

Previous versions will be archived and available upon request.`
        }
    ];

    return (
        <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <SEO
                title="Privacy Policy - No Noise Stories"
                description="Learn how No Noise Stories collects, uses, and protects your personal information. Our commitment to your privacy and data security."
                type="website"
            />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
                
                .privacy-heading { font-family: 'Playfair Display', serif; }
                .privacy-body { font-family: 'DM Sans', sans-serif; }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.6s ease-out both;
                }
                
                .animate-delay-100 { animation-delay: 0.1s; }
                .animate-delay-200 { animation-delay: 0.2s; }
                .animate-delay-300 { animation-delay: 0.3s; }
                
                .accordion-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                }
                
                .accordion-content.open {
                    max-height: 2000px;
                    transition: max-height 0.5s ease-in;
                }
            `}</style>

           
            <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-white/5">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,122,24,0.3) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>
                
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center animate-fadeInUp">
                        <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10">
                            <Shield className="text-orange-400" size={20} />
                            <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">Your Privacy Matters</span>
                        </div>
                        
                        <h1 className="privacy-heading text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Policy</span>
                        </h1>
                        
                        <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-6">
                            At <strong className="text-white">No Noise Stories</strong>, we are committed to protecting your privacy and ensuring the security of your personal information.
                        </p>
                        
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                            <FileText size={16} />
                            <span>Last Updated: March 17, 2026</span>
                        </div>
                    </div>
                </div>
            </div>

           
            <div className="bg-slate-900 border-b border-white/5">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInUp animate-delay-100">
                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-950/50 border border-white/5">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
                                <Eye className="text-orange-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-2">Transparency</h3>
                                <p className="text-slate-400 text-sm">We clearly explain what data we collect and why</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-950/50 border border-white/5">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
                                <Lock className="text-orange-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-2">Security</h3>
                                <p className="text-slate-400 text-sm">Industry-standard encryption and security measures</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-950/50 border border-white/5">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center">
                                <UserCheck className="text-orange-400" size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-2">Control</h3>
                                <p className="text-slate-400 text-sm">You have full control over your personal data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
             
                <div className="mb-12 animate-fadeInUp animate-delay-200">
                    <p className="text-slate-300 leading-relaxed mb-4">
                        Welcome to <strong className="text-white">No Noise Stories</strong>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong className="text-orange-400">nonoisestories.com</strong>, read our articles, watch our videos, or interact with our services.
                    </p>
                    <p className="text-slate-300 leading-relaxed mb-4">
                        We are a digital news platform dedicated to delivering clear, accurate, and impactful stories. As a news organization, we understand the importance of maintaining your trust and protecting your personal information.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this policy.
                    </p>
                </div>

              
                <div className="space-y-4 animate-fadeInUp animate-delay-300">
                    {policySections.map((section, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-white/5 bg-slate-900/50 overflow-hidden transition-all duration-300 hover:border-orange-500/20"
                        >
                            <button
                                onClick={() => toggleSection(index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center text-orange-400">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-white font-bold text-lg">{section.title}</h2>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                                        openSection === index ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            
                            <div className={`accordion-content ${openSection === index ? 'open' : ''}`}>
                                <div className="px-6 pb-6 pt-2 border-t border-white/5">
                                    <div className="pl-14 privacy-body text-slate-300 leading-relaxed whitespace-pre-line">
                                        {section.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

               
                <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                    <h3 className="privacy-heading text-2xl font-bold text-white mb-6 text-center">
                        Questions About Your Privacy?
                    </h3>
                    
                    <p className="text-slate-300 text-center mb-8">
                        If you have any questions or concerns about this Privacy Policy or our data practices, please don't hesitate to contact us.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="mailto:contact@nonoisestories.com"
                            className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-orange-500/30 transition-all group"
                        >
                            <Mail className="text-orange-400 flex-shrink-0" size={20} />
                            <div>
                                <div className="text-slate-400 text-xs mb-1">Email</div>
                                <div className="text-white text-sm font-medium group-hover:text-orange-400 transition-colors">contact@nonoisestories.com</div>
                            </div>
                        </a>
                        
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                            <Phone className="text-orange-400 flex-shrink-0" size={20} />
                            <div>
                                <div className="text-slate-400 text-xs mb-1">Phone</div>
                                <div className="text-white text-sm font-medium">+91 XXXXX XXXXX</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-white/5">
                            <MapPin className="text-orange-400 flex-shrink-0" size={20} />
                            <div>
                                <div className="text-slate-400 text-xs mb-1">Address</div>
                                <div className="text-white text-sm font-medium">India</div>
                            </div>
                        </div>
                    </div>
                </div>

              
                <div className="mt-12 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-orange-500/30 text-orange-400 text-sm font-semibold hover:bg-orange-500/10 transition-all"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
