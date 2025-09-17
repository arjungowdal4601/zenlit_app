"use client";

import { Paperclip, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  onSend: (text: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

const Composer = ({ onSend, value, onChange }: Props) => {
  const [inner, setInner] = useState("");
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const val = value !== undefined ? value : inner;

  const canSend = useMemo(() => val.trim().length > 0, [val]);

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
    <div className="sticky bottom-0 z-50 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-t border-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 min-h-[40px] bg-slate-900 rounded-2xl px-3 py-2 border border-slate-800">
            <textarea
              ref={taRef}
              className="w-full resize-none bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
              rows={1}
              placeholder="Message"
              value={val}
              onChange={(e) => handleChange(e.target.value)}
            />
          </div>
          <button className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Attach">
            <Paperclip className="text-gray-200" size={20} />
          </button>
          <button onClick={handleSend} disabled={!canSend} className={`h-10 w-10 flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${canSend ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 cursor-not-allowed'}`} aria-label="Send">
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;