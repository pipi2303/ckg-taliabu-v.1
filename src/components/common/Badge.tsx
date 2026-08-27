import React from 'react';
import { Status, RuleVersionStatus, ConsentStatus, SyncStatus } from '../../types';

export type BadgeVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'retired'
  | 'revoked'
  | 'synced'
  | 'failed'
  | 'neutral'
  | 'warning'
  | 'info';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1.5',
    md: 'text-xs px-2.5 py-1 font-medium gap-1.5',
  };

  const dotColors: Record<BadgeVariant, string> = {
    active: 'bg-[#2E7D5B]',
    inactive: 'bg-[#60716D]',
    pending: 'bg-[#C99720]',
    draft: 'bg-[#60716D]',
    review: 'bg-[#397B94]',
    approved: 'bg-[#2E7D5B]',
    published: 'bg-[#00201C]',
    retired: 'bg-[#8F9E9B]',
    revoked: 'bg-[#C84A4A]',
    synced: 'bg-[#2E7D5B]',
    failed: 'bg-[#C84A4A]',
    neutral: 'bg-[#60716D]',
    warning: 'bg-[#C99720]',
    info: 'bg-[#397B94]',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    active: 'bg-[#EBF7F2] text-[#1E583F] border border-[#C6EAD9]',
    inactive: 'bg-[#F0F4F3] text-[#60716D] border border-[#D8E5E2]',
    pending: 'bg-[#FFFACD] text-[#8C6407] border border-[#F5EC9C]',
    draft: 'bg-[#F0F4F3] text-[#485653] border border-[#D0DFDC]',
    review: 'bg-[#E1F5FE] text-[#1E5D75] border border-[#BDE3F5]',
    approved: 'bg-[#EBF7F2] text-[#1E583F] border border-[#C6EAD9]',
    published: 'bg-[#00201C] text-white border border-[#00201C]',
    retired: 'bg-[#F0F4F3] text-[#8F9E9B] border border-[#D8E5E2] line-through',
    revoked: 'bg-[#FDF0F0] text-[#9A2D2D] border border-[#F8C6C6]',
    synced: 'bg-[#EBF7F2] text-[#1E583F] border border-[#C6EAD9]',
    failed: 'bg-[#FDF0F0] text-[#9A2D2D] border border-[#F8C6C6]',
    neutral: 'bg-[#F0F4F3] text-[#334643] border border-[#D8E5E2]',
    warning: 'bg-[#FFFACD] text-[#8C6407] border border-[#F5EC9C]',
    info: 'bg-[#E1F5FE] text-[#1E5D75] border border-[#BDE3F5]',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md whitespace-nowrap shrink-0 transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]} ${variant === 'published' ? 'bg-emerald-400' : ''}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export function getStatusBadgeVariant(status: Status | RuleVersionStatus | ConsentStatus | SyncStatus | string): BadgeVariant {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
      return 'inactive';
    case 'DRAFT':
      return 'draft';
    case 'REVIEW':
      return 'review';
    case 'APPROVED':
      return 'approved';
    case 'PUBLISHED':
      return 'published';
    case 'RETIRED':
      return 'retired';
    case 'REVOKED':
      return 'revoked';
    case 'PENDING':
    case 'PENDING_SYNC':
      return 'pending';
    case 'SYNCING':
      return 'info';
    case 'SYNCED':
      return 'synced';
    case 'FAILED':
    case 'CONFLICT':
      return 'failed';
    default:
      return 'neutral';
  }
}
