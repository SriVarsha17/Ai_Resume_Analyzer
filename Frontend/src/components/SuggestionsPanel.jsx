import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle } from "lucide-react";

const SuggestionsPanel = ({ suggestions = [], bulletPointImprovements = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Suggestions List */}
      {suggestions.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand-400" />
            Key Recommendations
          </h3>
          <ul className="flex flex-col gap-3">
            {suggestions.map((sug, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-white/90"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xs mt-0.5">
                  {idx + 1}
                </span>
                <p className="leading-relaxed">{sug}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bullet Points Rewrite Panel */}
      {bulletPointImprovements.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-white/5 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-accent-500" />
            Bullet Point Transformer
          </h3>
          <p className="text-sm text-dark-500 mb-6">
            Compare weak bullet points from your resume and see how they can be rewritten to include
            impact, actions, and metrics.
          </p>

          <div className="flex flex-col gap-4">
            {bulletPointImprovements.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-white/5 rounded-xl overflow-hidden bg-white/5 transition-all"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-all"
                  >
                    <div className="flex-1 pr-4">
                      <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                        Rewrite Suggestion #{idx + 1}
                      </span>
                      <p className="text-sm font-medium text-white mt-1 truncate max-w-lg">
                        {item.original}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-dark-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-dark-500" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/5 flex flex-col gap-4 bg-dark-900/40">
                      {/* Original vs Improved */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-danger-500/5 border border-danger-500/10">
                          <span className="text-xs font-bold text-danger-500 uppercase tracking-wider block mb-2">
                            Original Bullet Point
                          </span>
                          <p className="text-sm text-white/80 leading-relaxed italic">
                            "{item.original}"
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/10">
                          <span className="text-xs font-bold text-accent-500 uppercase tracking-wider block mb-2">
                            Recommended Rewrite
                          </span>
                          <p className="text-sm text-white leading-relaxed font-medium">
                            "{item.improved}"
                          </p>
                        </div>
                      </div>

                      {/* Explanation */}
                      {item.explanation && (
                        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-dark-500 leading-relaxed">
                          <span className="font-semibold text-white/80 block mb-1">
                            Why this rewrite works:
                          </span>
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionsPanel;
