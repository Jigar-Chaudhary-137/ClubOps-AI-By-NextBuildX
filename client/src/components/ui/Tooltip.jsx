import React, { useState } from 'react';

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2'
};

export default function Tooltip({
  children,
  content,
  position = 'top',
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return <>{children}</>;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`
            absolute z-50 pointer-events-none whitespace-nowrap px-2.5 py-1 text-xs font-medium
            rounded-md bg-[#1E293B] text-[#F8FAFC] border border-[#334155] shadow-lg
            animate-in fade-in zoom-in-95 duration-150
            ${positionClasses[position] || positionClasses.top}
            ${className}
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}
