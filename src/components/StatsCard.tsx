import React from 'react';

interface StatsCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.FC<{ className?: string }>;
  trend?: {
    text: string;
    isPositive?: boolean;
  };
  accentColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
  onClick
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-[#EFF6FF] text-[#0045A5]',
      ring: 'hover:border-[#0045A5]/40 hover:shadow-[0_8px_24px_rgba(0,69,165,0.08)]',
    },
    emerald: {
      iconBg: 'bg-[#ECFDF5] text-[#059669]',
      ring: 'hover:border-[#059669]/40 hover:shadow-[0_8px_24px_rgba(5,150,105,0.08)]',
    },
    amber: {
      iconBg: 'bg-[#FFFBEB] text-[#D97706]',
      ring: 'hover:border-[#D97706]/40 hover:shadow-[0_8px_24px_rgba(217,119,6,0.08)]',
    },
    purple: {
      iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
      ring: 'hover:border-[#7C3AED]/40 hover:shadow-[0_8px_24px_rgba(124,58,237,0.08)]',
    },
    red: {
      iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
      ring: 'hover:border-[#DC2626]/40 hover:shadow-[0_8px_24px_rgba(220,38,38,0.08)]',
    },
  };

  const selectedColor = colorMap[accentColor] || colorMap.blue;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative p-6 rounded-[24px] glass-card glass-card-hover border border-slate-200/80 transition-all duration-200 ${
        onClick ? `cursor-pointer ${selectedColor.ring} active:scale-[0.99]` : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {value}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${selectedColor.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-[#64748B] font-normal text-[11px]">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`font-semibold text-[11px] px-2.5 py-0.5 rounded-full ${
                trend.isPositive === false 
                  ? 'text-rose-600 bg-rose-50 border border-rose-100' 
                  : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
              }`}
            >
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
