import { useState } from "react";

const channels = [
  {
    id: "yt",
    name: "YouTube",
    handle: "@NoNoiseStories",
    url: "https://www.youtube.com/@NoNoiseStories?sub_confirmation=1",
    label: "Subscribe",
    doneLabel: "Subscribed",
    bg: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" />
      </svg>
    ),
  },
  {
    id: "ig",
    name: "Instagram",
    handle: "@nonoisestories",
    url: "https://instagram.com/nonoisestories",
    label: "Follow",
    doneLabel: "Following",
    bg: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: "fb",
    name: "Facebook",
    handle: "facebook.com/NoNoiseStories",
    url: "https://facebook.com/NoNoiseStories",
    label: "Like Page",
    doneLabel: "Liked",
    bg: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    ),
  },
  {
    id: "tw",
    name: "X",
    handle: "@NoNoiseStories",
    url: "https://x.com/NoNoiseStories",
    label: "Follow",
    doneLabel: "Following",
    bg: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.626 5.906-5.626Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "li",
    name: "LinkedIn",
    handle: "no-noise-stories",
    url: "https://linkedin.com/company/no-noise-stories",
    label: "Follow",
    doneLabel: "Following",
    bg: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export default function SubscribeModal({ onClose }) {
  const [isOpen, setIsOpen] = useState(true);
  const [opened, setOpened] = useState({});
  const [confirmed, setConfirmed] = useState({});

  const confirmedCount = Object.values(confirmed).filter(Boolean).length;
  const allDone = confirmedCount === channels.length;
  const anyOpened = Object.values(opened).some(Boolean);

  function openOne(id) {
    const ch = channels.find((c) => c.id === id);
    window.open(ch.url, "_blank", "noopener,noreferrer");
    setOpened((prev) => ({ ...prev, [id]: true }));
  }

  function confirmOne(id) {
    setConfirmed((prev) => ({ ...prev, [id]: true }));
  }

  function openAll() {
    channels.forEach((c, i) => {
      if (!confirmed[c.id]) {
        setTimeout(() => {
          window.open(c.url, "_blank", "noopener,noreferrer");
          setOpened((prev) => ({ ...prev, [c.id]: true }));
        }, i * 300);
      }
    });
  }

  function handleClose() {
    setIsOpen(false);
    if (onClose) onClose();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap');

        /* ── Overlay ── */
        .nns-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: nns-fadein 0.25s ease;
        }

        /* ── Modal Card ── */
        .nns-modal {
          background: linear-gradient(180deg, #1a1a1a 0%, #141414 100%);
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          padding: 2rem 1.5rem;
          width: 100%;
          max-width: 780px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: nns-slidein 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .nns-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: white;
          border-radius: 20px 20px 0 0;
        }

        /* ── Close Button ── */
        .nns-close {
          position: absolute;
          top: 12px; right: 12px;
          background: #2a2a2a;
          border: none;
          color: white;
          width: 36px; height: 36px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }
        .nns-close:hover { 
          background: #FFA500; 
          color: #000;
          transform: rotate(90deg);
        }

        /* ── Logo Row ── */
        .nns-logo-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 0.75rem;
        }
        .nns-pulse-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #FFA500;
          animation: nns-pulse 1.8s ease-in-out infinite;
        }
        .nns-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; letter-spacing: 1.5px; color: #FFA500;
        }

        .nns-modal-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px; letter-spacing: 1px;
          color: #fff; margin-bottom: 4px; line-height: 1.1;
        }
        .nns-modal-sub {
          font-size: 13px; color: white;
          margin-bottom: 1rem; line-height: 1.5;
          font-family: 'Inter', sans-serif;
        }

        /* ── Progress Bar ── */
        .nns-progress {
          display: flex; gap: 6px;
          margin-bottom: 1rem;
        }
        .nns-pbar {
          flex: 1; height: 4px; border-radius: 2px;
          background: #2a2a2a;
          transition: background 0.4s;
        }
        .nns-pbar.on { background: #FFA500; }

        /* ── Tip Box ── */
        .nns-tip {
          background: rgba(255, 165, 0, 0.1);
          border: 1px solid #FFA50033;
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 1rem;
          font-size: 12px;
          color: #FFA500;
          line-height: 1.5;
          font-family: 'Inter', sans-serif;
        }

        /* ── Channel Rows ── */
        .nns-channels { 
          display: flex; 
          flex-direction: column; 
          gap: 10px; 
          margin-bottom: 1rem; 
        }

        .nns-ch-row {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          padding: 12px;
          transition: all 0.25s;
        }
        .nns-ch-row.confirmed { 
          border-color: #FFA50044; 
          background: rgba(255, 165, 0, 0.05);
        }
        .nns-ch-row:hover {
          border-color: #FFA50066;
          transform: translateX(2px);
        }

        .nns-ch-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .nns-ch-info { flex: 1; min-width: 0; }
        .nns-ch-name {
          font-size: 14px; font-weight: 600; color: #fff;
          margin-bottom: 2px; font-family: 'Inter', sans-serif;
        }
        .nns-ch-handle {
          font-size: 11px; color: white;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── Channel Buttons ── */
        .nns-ch-btn {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; border: none;
          white-space: nowrap; flex-shrink: 0;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .nns-ch-btn.open-btn { 
          background: white; 
          color:black;
          box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
        }
        .nns-ch-btn.open-btn:hover { 
          background: #FFB733; 
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(255, 165, 0, 0.4);
        }
        .nns-ch-btn.pending-btn {
          background: #2a2a2a; 
          color: #FFA500;
          border: 1px solid #FFA50055; 
          font-size: 11px;
        }
        .nns-ch-btn.pending-btn:hover { 
          background: #333;
          border-color: #FFA500;
        }
        .nns-ch-btn.done-btn {
          background: rgba(255, 165, 0, 0.15); 
          color: #FFA500;
          border: 1px solid #FFA50044; 
          cursor: default;
        }

        /* ── Main CTA Button ── */
        .nns-main-btn {
          width: 100%; 
          padding: 14px 20px;
          border: none; 
          border-radius: 12px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; 
          letter-spacing: 1px;
          cursor: pointer; 
          transition: all 0.2s;
          margin-bottom: 12px;
        }
        .nns-main-btn.active {
          // background: linear-gradient(135deg, #FFA500 0%, #FF6B00 60%, #FFD700 100%);
          background:white;
          color: #000;
          box-shadow: 0 4px 20px rgba(255, 165, 0, 0.4);
          font-weight:500;
          font-size:"22px";
        }
        .nns-main-btn.active:hover { 
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 165, 0, 0.5);
        }
        .nns-main-btn:active {
          transform: translateY(0);
        }
        .nns-main-btn:disabled {
          background: rgba(255, 165, 0, 0.2); 
          color: #FFA500;
          border: 1px solid #FFA50033;
          cursor: default; 
          font-size: 14px;
        }

        /* ── Status Text ── */
        .nns-status {
          text-align: center; 
          font-size: 12px;
          color: white; 
          font-family: 'Inter', sans-serif;
          min-height: 16px;
          padding: 0 10px;
        }
        .nns-status.ok { 
          color: #FFA500; 
          font-weight: 500;
        }

        /* ── Animations ── */
        @keyframes nns-fadein { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes nns-slidein { 
          from { transform: translateY(30px) scale(0.95); opacity: 0; } 
          to { transform: translateY(0) scale(1); opacity: 1; } 
        }
        @keyframes nns-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        /* ── Responsive Design ── */
        @media (max-width: 640px) {
          .nns-overlay {
            padding: 0.5rem;
            align-items: flex-end;
          }
          
          .nns-modal {
            max-height: 85vh;
            padding: 1.5rem 1rem;
            border-radius: 20px 20px 0 0;
            margin-bottom: 0;
          }
          
          .nns-modal::before {
            border-radius: 20px 20px 0 0;
          }
          
          .nns-modal-title {
            font-size: 24px;
          }
          
          .nns-modal-sub {
            font-size: 12px;
          }
          
          .nns-ch-row {
            padding: 10px;
            gap: 10px;
          }
          
          .nns-ch-icon {
            width: 40px; 
            height: 40px;
          }
          
          .nns-ch-name {
            font-size: 13px;
          }
          
          .nns-ch-handle {
            font-size: 10px;
          }
          
          .nns-ch-btn {
            padding: 7px 14px;
            font-size: 11px;
          }
          
          .nns-main-btn {
            padding: 12px 16px;
            font-size: 16px;
          }
          
          .nns-close {
            width: 32px; 
            height: 32px;
            top: 10px; 
            right: 10px;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .nns-modal {
            padding: 1.75rem;
          }
          
          .nns-modal-title {
            font-size: 26px;
          }
        }

        /* Custom scrollbar for modal */
        .nns-modal::-webkit-scrollbar {
          width: 6px;
        }
        .nns-modal::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 3px;
        }
        .nns-modal::-webkit-scrollbar-thumb {
          background: #FFA500;
          border-radius: 3px;
        }
        .nns-modal::-webkit-scrollbar-thumb:hover {
          background: #FFB733;
        }
      `}</style>

      {isOpen && (
        <div className="nns-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div className="nns-modal">

            {/* Close */}
            <button className="nns-close" onClick={handleClose} aria-label="Close">✕</button>

            {/* Header */}
            <div className="nns-logo-row">
              <div className="nns-pulse-dot" />
              <span className="nns-brand">No Noise Stories</span>
            </div>
            <div className="nns-modal-title">Stay in the Loop</div>
            <p className="nns-modal-sub">
              Click each platform → subscribe there → come back and confirm.
            </p>

            {/* Progress */}
            <div className="nns-progress">
              {channels.map((c) => (
                <div key={c.id} className={`nns-pbar${confirmed[c.id] ? " on" : ""}`} />
              ))}
            </div>

            {/* Tip — shown only after first open */}
            {anyOpened && !allDone && (
              <div className="nns-tip">
                💡 Platform opened in a new tab. Subscribe/Follow there, then click
                "✔ Done" to mark it here.
              </div>
            )}

            {/* Channel List */}
            <div className="nns-channels">
              {channels.map((c) => (
                <div key={c.id} className={`nns-ch-row${confirmed[c.id] ? " confirmed" : ""}`}>
                  <div className="nns-ch-icon" style={{ background: c.bg }}>
                    {c.icon}
                  </div>
                  <div className="nns-ch-info">
                    <div className="nns-ch-name">{c.name}</div>
                    <div className="nns-ch-handle">{c.handle}</div>
                  </div>

                  {confirmed[c.id] ? (
                    <button className="nns-ch-btn done-btn" disabled>
                       {c.doneLabel}
                    </button>
                  ) : opened[c.id] ? (
                    <button className="nns-ch-btn pending-btn" onClick={() => confirmOne(c.id)}>
                      ✔ Done
                    </button>
                  ) : (
                    <button className="nns-ch-btn open-btn" onClick={() => openOne(c.id)}>
                       {c.label}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Main CTA */}
            <button
              className={`nns-main-btn${allDone ? "" : " active"}`}
              onClick={openAll}
              disabled={allDone}
            >
              {allDone
                ? "✓ All Subscribed — Thank You!"
                : anyOpened
                ? "↗ Open Remaining Channels"
                : " Open All Channels at Once"}
            </button>

            {/* Status */}
            <div className={`nns-status${allDone ? " ok" : ""}`}>
              {allDone
                ? "Welcome to the No Noise family! Every story, every platform."
                : anyOpened
                ? `${confirmedCount} confirmed • Click "✔ Done" after subscribing each`
                : `${confirmedCount} of ${channels.length} channels subscribed`}
            </div>
          </div>
        </div>
      )}
    </>
  );
}