import { useState } from "react";
import { Puzzle, CheckCircle2, Copy, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export default function ExtensionBanner() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const extensionPath = "c:\\Users\\colos\\Downloads\\linkedin-outreach-tracker\\extension";

  const copyPath = () => {
    navigator.clipboard.writeText(extensionPath);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateExtensionCapture = () => {
    const mockProfiles = [
      {
        name: "Sarah Jenkins",
        title: "VP of Engineering @ TechScale",
        company: "TechScale",
        linkedinUrl: "https://www.linkedin.com/in/sarah-jenkins-demo",
        stage: "to_reach_out",
        notes: "Captured via Chrome Extension. Interested in AI infrastructure tooling.",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
      },
      {
        name: "Alex Rivera",
        title: "Head of Product & Growth",
        company: "Apex Systems",
        linkedinUrl: "https://www.linkedin.com/in/alex-rivera-demo",
        stage: "connected",
        notes: "Connected last week. Met at Tech Summit 2026.",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      }
    ];

    const randomProfile = mockProfiles[Math.floor(Math.random() * mockProfiles.length)];

    window.postMessage({
      type: "OUTREACH_TRACKER_ADD_PROFILE",
      profile: randomProfile
    }, "*");
  };

  return (
    <div className="mb-8 border border-brass/30 bg-gradient-to-r from-brass/10 via-surface to-brass/5 rounded-card p-5 shadow-card relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-brass/20 rounded-lg text-brass-dark shrink-0 mt-0.5">
            <Puzzle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base text-ink">
                Chrome Extension Ready
              </h3>
              <span className="text-[10px] font-mono uppercase bg-brass/20 text-brass-dark px-2 py-0.5 rounded-full font-semibold">
                Manifest V3
              </span>
            </div>
            <p className="text-xs text-ink-soft mt-1 leading-relaxed max-w-2xl">
              Extract any LinkedIn profile with 1 click and automatically load details directly into this dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={simulateExtensionCapture}
            className="flex items-center gap-1.5 bg-brass hover:bg-brass-light text-ink text-xs font-semibold px-3 py-2 rounded-sm transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Test Auto-Load</span>
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink px-2.5 py-2 border border-line rounded-sm transition-colors"
          >
            <span>{expanded ? "Hide Setup Guide" : "Install Guide"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-line text-xs text-ink-soft space-y-3 animate-fade-in">
          <p className="font-semibold text-ink">3 Quick Steps to Load in Chrome:</p>
          <ol className="list-decimal list-inside space-y-2 ml-1">
            <li>
              Open <code className="bg-paper text-brass-dark px-1.5 py-0.5 rounded font-mono border border-line">chrome://extensions</code> in your Chrome browser.
            </li>
            <li>
              Enable <strong className="text-ink">Developer mode</strong> (toggle in the top-right corner).
            </li>
            <li>
              Click <strong className="text-ink">Load unpacked</strong> and select your project's <code className="bg-paper text-ink px-1.5 py-0.5 rounded font-mono">extension</code> folder.
            </li>
          </ol>

          <div className="flex items-center gap-2 mt-3 pt-2">
            <span className="text-ink font-medium">Extension Folder Path:</span>
            <code className="bg-paper text-brass-dark px-2 py-1 rounded font-mono text-[11px] border border-line truncate max-w-md">
              {extensionPath}
            </code>
            <button
              onClick={copyPath}
              className="flex items-center gap-1 text-xs text-ink hover:text-brass transition-colors border border-line px-2 py-1 rounded"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Path"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
