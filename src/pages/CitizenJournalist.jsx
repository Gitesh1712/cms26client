import { useState } from "react";
import { api } from "../services/api";
import LexicalEditor from "../components/LexicalEditor";


const SUBMISSION_TYPES = [
  {
    id: "Story Idea",
    icon: "💡",
    title: "Story Idea",
    desc: "Share a lead or concept — our team will research and write it",
  },
  {
    id: "Full Article",
    icon: "✍️",
    title: "Full Article",
    desc: "Submit a complete, written article for editorial review",
  },
  {
    id: "Video Suggestion",
    icon: "🎥",
    title: "Video Suggestion",
    desc: "Propose a video topic or share an existing video link",
  },
];

export default function SubmitStory() {
  const [step, setStep] = useState(1);
  const [submissionType, setSubmissionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
  name: "",
  email: "",
  mobile: "",
  storyTitle: "",
  storyContent: "",
});
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleContentChange = (content) => {
    setForm((prev) => ({ ...prev, storyContent: content }));
  };

  const handleTypeSelect = (type) => {
    setSubmissionType(type);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(
        "/public/leads/submit-story",
        { ...form, submissionType },
        {}
      );
      setStep(3);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSubmissionType("");
    setForm({
  name: "",
  email: "",
  mobile: "",
  storyTitle: "",
  storyContent: "",
});
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-20">

      <div className="text-center px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 bg-gradient-to-b from-orange-500/10 to-transparent border-b border-white/5">
        <div className="inline-block bg-orange-500/15 text-orange-500 border border-orange-500/30 rounded-full px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-bold tracking-widest mb-4 sm:mb-5">
          COMMUNITY
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight">
          Share Your <span className="text-orange-500">Story</span>
        </h1>
        <p className="text-white-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto px-2">
          Have a story that the world needs to hear? <br className="hidden sm:block" />
          Submit your idea or article — our editorial team will review and publish it.
        </p>
      </div>

    
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        
       
        {step === 1 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-8 md:p-10">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-6 sm:mb-7 text-white">
              What would you like to submit?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {SUBMISSION_TYPES.map((t) => (
                <button
                  key={t.id}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-5 sm:p-6 cursor-pointer flex flex-col items-center gap-2 sm:gap-3 transition-all hover:border-orange-500 hover:bg-orange-500/10 text-white group"
                  onClick={() => handleTypeSelect(t.id)}
                >
                  <span className="text-3xl sm:text-4xl">{t.icon}</span>
                  <span className="text-sm sm:text-base font-bold">{t.title}</span>
                  <span className="text-xs sm:text-sm text-white-400 text-center leading-relaxed">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      
        {step === 2 && (
          <div className={`bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-6 md:p-8 mx-auto ${
            submissionType === "Full Article" ? "max-w-4xl" : "max-w-2xl"
          }`}>
            <button 
              className="text-white-400 hover:text-white text-sm mb-4 sm:mb-5 flex items-center gap-2 transition-colors"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>

            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm text-orange-500 font-semibold mb-4 sm:mb-5">
              {SUBMISSION_TYPES.find((t) => t.id === submissionType)?.icon}{" "}
              {submissionType}
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-5 sm:mb-7 text-white">
              Your Details
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
              
           
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-white-300 tracking-wide">
                    Full Name *
                  </label>
                  <input 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors w-full placeholder-slate-500"
                    name="name" 
                    value={form.name} 
                    onChange={handleChange}
                    placeholder="Your full name" 
                    required 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-white-300 tracking-wide">
                    Email Address *
                  </label>
                  <input 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors w-full placeholder-slate-500"
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange}
                    placeholder="you@email.com" 
                    required 
                  />
                </div>
              </div>

<div className="flex flex-col gap-2">
  <label className="text-xs sm:text-sm font-semibold text-white-300 tracking-wide">
    Mobile Number *
  </label>
  <input
    className="bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors w-full placeholder-slate-500"
    name="mobile"
    value={form.mobile}
    onChange={handleChange}
    placeholder="10-digit mobile number"
    required
  />
</div>

        
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-semibold text-white-300 tracking-wide">
                  {submissionType === "Video Suggestion" ? "Video Topic / Title *" : "Story Title *"}
                </label>
                <input 
                  className="bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors w-full placeholder-slate-500"
                  name="storyTitle" 
                  value={form.storyTitle} 
                  onChange={handleChange}
                  placeholder={submissionType === "Video Suggestion" ? "What should the video be about?" : "Enter a clear, descriptive title"}
                  required 
                />
              </div>

           
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-semibold text-white-300 tracking-wide">
                  {submissionType === "Story Idea"
                    ? "Describe Your Idea *"
                    : submissionType === "Full Article"
                    ? "Article Content *"
                    : "Video Description or YouTube Link *"}
                </label>

                {submissionType === "Full Article" ? (
                  <div className="mt-1">
                    <LexicalEditor
                      value={form.storyContent}
                      onChange={handleContentChange}
                      placeholder="Write your complete article here... Use 'Add Media' to embed YouTube, Twitter, Instagram posts and images."
                    />
                    <p className="text-white-500 text-[10px] sm:text-xs mt-2 leading-relaxed">
                      💡 Tip: Use "Add Media" button to embed YouTube videos, Twitter/X posts, Instagram posts, Facebook posts, or images inside your article.
                    </p>
                  </div>
                ) : (
                  <textarea
                    className="bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm focus:border-orange-500 focus:outline-none transition-colors w-full resize-y min-h-[160px] leading-relaxed placeholder-slate-500"
                    name="storyContent"
                    value={form.storyContent}
                    onChange={handleChange}
                    placeholder={
                      submissionType === "Story Idea"
                        ? "Describe the story — what is it about, where did the lead come from, any sources or references?"
                        : "Describe the video concept in detail, or paste a YouTube link..."
                    }
                    required
                    rows={8}
                  />
                )}
              </div>

     
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

        
              <button
                type="submit"
                className={`bg-orange-500 hover:bg-orange-600 text-white border-none rounded-lg px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold cursor-pointer transition-all self-start ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:scale-105"
                }`}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Story →"}
              </button>

     
              <p className="text-white-500 text-xs leading-relaxed">
                * After submission, our editorial team will review your story within 3–5 working days.
                You will be notified via email if your story is selected for publication.
              </p>
            </form>
          </div>
        )}
        

  
        {step === 3 && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 sm:p-10 md:p-12 text-center">
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-5">✅</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
              Submission Received!
            </h2>
            <p className="text-white-400 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto px-2">
              Thank you for contributing to NoNoiseStories. <br />
              Our editorial team will review your submission within 3–5 working days. <br />
              If selected, you will receive a confirmation at{" "}
              <strong className="text-orange-500">{form.email}</strong>.
            </p>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-lg px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold cursor-pointer transition-all hover:scale-105"
              onClick={resetForm}
            >
              Submit Another Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
}