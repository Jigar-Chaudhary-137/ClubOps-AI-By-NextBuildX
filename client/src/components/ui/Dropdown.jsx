import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({
  trigger,
  items = [],
  align = 'right',
  children,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const alignClass = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute ${alignClass} mt-1.5 w-48 rounded-lg bg-[#151D2E] border border-[#263247]
            shadow-xl py-1 z-50 text-sm overflow-hidden animate-in fade-in zoom-in-95
            ${className}
          `}
        >
          {items.length > 0
            ? items.map((item, idx) => {
                if (item.separator) {
                  return <hr key={idx} className="border-[#263247] my-1" />;
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick?.();
                        setIsOpen(false);
                      }
                    }}
                    className={`
                      w-full text-left px-3.5 py-2 flex items-center gap-2.5 transition-colors
                      disabled:opacity-40 disabled:cursor-not-allowed
                      ${
                        item.danger
                          ? 'text-[#EF4444] hover:bg-[#EF4444]/10'
                          : 'text-[#F8FAFC] hover:bg-[#1E293B]'
                      }
                    `}
                  >
                    {item.icon && <span className="w-4 h-4 shrink-0 text-[#94A3B8]">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })
            : children}
        </div>
      )}
    </div>
  );
}
