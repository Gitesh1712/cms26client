// src/components/SessionWarning.jsx
const SessionWarning = ({ countdown, onStayLoggedIn }) => {
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Session Expire Ho Raha Hai</h2>
        <p className="text-slate-400 text-sm mb-6">
          Aap{' '}
          <span className="text-orange-400 font-bold text-lg">
            {mins}:{String(secs).padStart(2, '0')}
          </span>{' '}
          mein automatically logout ho jayenge.
        </p>
        <button
          onClick={onStayLoggedIn}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#FFCC66] to-[#FF7A18] hover:opacity-90 transition-opacity"
        >
          Login Rehna Chahta Hoon
        </button>
      </div>
    </div>
  );
};

export default SessionWarning;