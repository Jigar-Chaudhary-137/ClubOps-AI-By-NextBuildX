import React from 'react';

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = ''
}) {
  const variantClasses = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <div
      style={{ width, height }}
      className={`
        animate-pulse bg-[#1E293B]/80
        ${variantClasses[variant] || variantClasses.text}
        ${className}
      `}
    />
  );
}
