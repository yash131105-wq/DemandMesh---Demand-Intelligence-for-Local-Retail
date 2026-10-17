import React from 'react';

export const LivingMeshBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
      aria-hidden="true"
    >
      {/* Ambient radial teal gradient glow */}
      <div 
        className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full opacity-[0.045] blur-3xl"
        style={{
          background: 'radial-gradient(circle, #0BA69C 0%, #31D5CD 40%, transparent 70%)',
        }}
      />
      
      {/* Secondary gold/warm light field */}
      <div 
        className="absolute top-1/2 -left-48 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-3xl"
        style={{
          background: 'radial-gradient(circle, #DCA84E 0%, #0BA69C 50%, transparent 80%)',
        }}
      />

      {/* Subtle geometric grid */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="mesh-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#0B1730" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.5" fill="#0BA69C" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh-grid)" />
      </svg>

      {/* Delicate floating network lines & nodes in hero ambient */}
      <svg 
        className="absolute top-10 right-10 w-96 h-80 opacity-20 hidden lg:block"
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Interconnected node lines */}
        <line x1="60" y1="80" x2="180" y2="40" stroke="#0BA69C" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="180" y1="40" x2="310" y2="110" stroke="#0BA69C" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="180" y1="40" x2="210" y2="190" stroke="#31D5CD" strokeWidth="1.2" />
        <line x1="60" y1="80" x2="110" y2="220" stroke="#0BA69C" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="110" y1="220" x2="210" y2="190" stroke="#0BA69C" strokeWidth="1" />
        <line x1="210" y1="190" x2="310" y2="110" stroke="#0BA69C" strokeWidth="1" />
        <line x1="210" y1="190" x2="270" y2="280" stroke="#DCA84E" strokeWidth="1" strokeDasharray="2 2" />

        {/* Nodes */}
        <circle cx="60" cy="80" r="3.5" fill="#101F3B" stroke="#0BA69C" strokeWidth="1.5" />
        <circle cx="180" cy="40" r="4" fill="#0BA69C" />
        <circle cx="310" cy="110" r="3.5" fill="#101F3B" stroke="#31D5CD" strokeWidth="1.5" />
        <circle cx="210" cy="190" r="5" fill="#31D5CD" className="animate-mesh-pulse" />
        <circle cx="110" cy="220" r="3" fill="#0B1730" stroke="#0BA69C" strokeWidth="1" />
        <circle cx="270" cy="280" r="3.5" fill="#DCA84E" />
      </svg>
    </div>
  );
};
