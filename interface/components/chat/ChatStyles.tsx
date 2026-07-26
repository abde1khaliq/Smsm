import { colors } from './Extras';

export function ChatStyles() {
  return (
    <style>{`
      /* ---- streaming cursor: 1px hard-blink, matches steps(2) 0.9s spec ---- */
      @keyframes smsm-blink {
        to { opacity: 0; }
      }
      .smsm-cursor {
        display: inline-block;
        width: 1px;
        height: 1em;
        background: ${colors.accent};
        vertical-align: -0.15em;
        margin-left: 1px;
        animation: smsm-blink 0.9s steps(2) infinite;
      }
      .smsm-textarea::placeholder {
        color: ${colors.placeholder};
      }

      /* ---- per-chunk glow: each streamed piece of text highlights on
         arrival, then fades to plain — the animated version of the static
         mid-stream highlight in the reference frame ---- */
      .smsm-chunk {
        display: inline;
        padding: 0 1px;
        margin: 0 -1px;
        border-radius: 3px;
        animation: smsm-chunk-glow 900ms ease-out forwards;
      }
      @keyframes smsm-chunk-glow {
        0% { background: rgba(245, 241, 232, 0.28); }
        100% { background: rgba(245, 241, 232, 0); }
      }

      /* ---- thinking dots: staggered pulse, paired with the orb's ring ---- */
      .smsm-dot {
        width: 5px;
        height: 5px;
        border-radius: 9999px;
        background: ${colors.accent};
        animation: smsm-dot-bounce 1s ease-in-out infinite;
      }
      @keyframes smsm-dot-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
        30% { transform: translateY(-3px); opacity: 1; }
      }

      .smsm-orb {
        border-radius: 9999px;
        background: radial-gradient(
          circle at 32% 28%,
          #F5F1E8 0%,
          #CBC2AC 32%,
          #6E6656 62%,
          #1B1B1E 100%
        );
        box-shadow:
          inset -3px -4px 7px rgba(0, 0, 0, 0.55),
          inset 2px 2px 5px rgba(255, 255, 255, 0.16),
          0 0 12px rgba(245, 241, 232, 0.20),
          0 0 26px rgba(245, 241, 232, 0.10);
        animation: smsm-breathe 4.2s ease-in-out infinite;
        transform-origin: center;
        will-change: transform;
      }
      .smsm-orb-active {
        animation-name: smsm-breathe-active;
        animation-duration: 1.7s;
      }
      .smsm-orb-thinking {
        animation: smsm-pulse-thinking 1.15s ease-in-out infinite;
      }
      .smsm-orb-thinking::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 9999px;
        border: 1.5px solid transparent;
        border-top-color: rgba(245, 241, 232, 0.85);
        animation: smsm-spin 0.9s linear infinite;
      }
      .smsm-orb-shine {
        position: absolute;
        width: 40%;
        height: 40%;
        top: 14%;
        left: 18%;
        border-radius: 9999px;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.9) 0%,
          rgba(255, 255, 255, 0) 72%
        );
        filter: blur(0.4px);
        animation: smsm-shine-drift 5.5s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes smsm-breathe {
        0%, 100% { transform: scale(1) translateY(0); }
        50% { transform: scale(1.045) translateY(-1.5px); }
      }
      @keyframes smsm-breathe-active {
        0%, 100% { transform: scale(1) translateY(0); }
        50% { transform: scale(1.09) translateY(-1px); }
      }
      @keyframes smsm-pulse-thinking {
        0%, 100% { transform: scale(1); opacity: 0.88; }
        50% { transform: scale(1.1); opacity: 1; }
      }
      @keyframes smsm-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes smsm-shine-drift {
        0%, 100% { top: 14%; left: 18%; opacity: 0.7; }
        50% { top: 9%; left: 27%; opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .smsm-orb,
        .smsm-orb-active,
        .smsm-orb-thinking,
        .smsm-orb-thinking::before,
        .smsm-orb-shine,
        .smsm-dot,
        .smsm-chunk,
        .smsm-cursor {
          animation: none !important;
        }
        .smsm-chunk {
          background: transparent !important;
        }
      }
    `}</style>
  );
}
