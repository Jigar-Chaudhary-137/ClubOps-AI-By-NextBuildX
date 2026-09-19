import React from 'react';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
};

const statusMap = {
  online: 'bg-[#22C55E]',
  offline: 'bg-[#64748B]',
  busy: 'bg-[#EF4444]'
};

export default function Avatar({
  src,
  name = '',
  size = 'md',
  status,
  className = ''
}) {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`
          ${sizeMap[size] || sizeMap.md} rounded-full flex items-center justify-center font-semibold
          bg-gradient-to-br from-[#1E293B] to-[#334155] text-[#F8FAFC] border border-[#263247]
          overflow-hidden select-none
        `}
      >
        {src ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0B1020]
            ${statusMap[status] || statusMap.online}
          `}
        />
      )}
    </div>
  );
}
