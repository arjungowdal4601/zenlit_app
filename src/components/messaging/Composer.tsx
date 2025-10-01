"use client";

import { Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  onSend: (text: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const Composer = ({ onSend, value, onChange, disabled = false }: Props) => {
  const [inner, setInner] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const val = value !== undefined ? value : inner;

  const canSend = useMemo(() => !disabled && val.trim().length > 0, [val, disabled]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    const next = Math.min(ta.scrollHeight, 4 * 24);
    ta.style.height = next + "px";
  }, [val]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(val.trim());
    if (value === undefined) {
      setInner("");
    }
  };

  const handleChange = (v: string) => {
    if (onChange) onChange(v);
    else setInner(v);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-t border-slate-800" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2">
          <div className={`flex-1 min-h-[40px] rounded-2xl px-3 py-2 border ${disabled ? 'bg-slate-900 border-slate-700 opacity-60' : 'bg-black border-white'}`}>
            <textarea
              ref={taRef}
              className={`w-full resize-none bg-transparent outline-none text-sm ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-white'}`}
              rows={1}
              value={val}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              placeholder={disabled ? 'Chat is read-only. Out of proximity.' : 'Type a message'}
            />
          </div>
          <button onClick={handleSend} disabled={!canSend} className="h-10 w-10 flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-not-allowed" aria-label="Send">
            <Send size={18} className={disabled ? "text-gray-500" : "text-white"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;