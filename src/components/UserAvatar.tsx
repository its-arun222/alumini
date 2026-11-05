import React from 'react';

interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'student' | 'alumni' | 'admin' | 'neutral';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  variant = 'neutral',
  className = '',
}) => {
  // Extract initials cleanly without academic titles
  const cleanName = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.)\s+/i, '').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : (parts[0]?.slice(0, 2) || 'M').toUpperCase();

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-xs font-semibold',
    lg: 'w-12 h-12 text-sm font-semibold',
    xl: 'w-16 h-16 text-lg sm:w-20 sm:h-20 sm:text-xl font-bold',
  }[size];

  const variantStyles = {
    student: 'bg-blue-50 text-blue-700 border border-blue-200',
    alumni: 'bg-slate-900 text-white border border-slate-800',
    admin: 'bg-slate-100 text-slate-800 border border-slate-300',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  }[variant];

  return (
    <div
      className={`rounded-xl flex items-center justify-center shrink-0 tracking-wide select-none ${sizeClasses} ${variantStyles} ${className}`}
      aria-label={`Initials for ${name}`}
    >
      {initials}
    </div>
  );
};
