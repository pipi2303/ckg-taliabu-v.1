import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'info' | 'lemon' | 'subtle';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantClasses = {
    default: 'bg-white border-[#D8E5E2] text-black',
    info: 'bg-[#E1F5FE] border-[#BDE3F5] text-black',
    lemon: 'bg-[#FFFACD] border-[#F5EC9C] text-[#8C6407]',
    subtle: 'bg-[#F8FBFA] border-[#D8E5E2] text-black',
  };

  return (
    <div
      className={`rounded-xl border p-5 shadow-2xs transition-all ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
