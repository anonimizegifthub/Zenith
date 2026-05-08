import React from 'react';

interface LoadingBarProps {
  text: string;
  subtext?: string;
  progress?: number;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ text, subtext, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px] p-8 border border-dashed border-slate-200 rounded-lg bg-slate-50 animate-fade-in relative overflow-hidden">
       {/* Background Grid Animation (Subtle) */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex justify-between items-end text-cyan-600 font-mono">
          <span className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></span>
            {text}
          </span>
          <span className="text-xs opacity-80">
            {progress !== undefined ? `${Math.round(progress)}%` : 'PROCESSING'}
          </span>
        </div>
        
        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden relative">
          {progress !== undefined ? (
            <div 
              className="h-full bg-cyan-600 shadow-sm transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          ) : (
            <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-600 to-transparent animate-indeterminate-bar"></div>
          )}
        </div>
        
        {subtext && (
          <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
             <span>SYSTEM_STATUS</span>
             <span>{subtext}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes indeterminate-bar {
          0% { left: -50%; }
          100% { left: 100%; }
        }
        .animate-indeterminate-bar {
          animation: indeterminate-bar 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};