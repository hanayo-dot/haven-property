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
  accentColor = 'emerald',
  onClick
}) => {
  const colorMap = {
    emerald: {
      iconBg: 'bg-[#F2F6F2] text-[#4A5D4A]',
      ring: 'hover:border-[#5A6D5A]/50 hover:shadow-[0_8px_24px_rgba(90,109,90,0.08)]',
    },
    amber: {
      iconBg: 'bg-[#FAF4EB] text-[#C28B38]',
      ring: 'hover:border-[#C28B38]/50 hover:shadow-[0_8px_24px_rgba(194,139,56,0.08)]',
    },
    blue: {
      iconBg: 'bg-[#F0F4F8] text-[#2C3E50]',
      ring: 'hover:border-[#2C3E50]/40 hover:shadow-[0_8px_24px_rgba(44,62,80,0.08)]',
    },
    purple: {
      iconBg: 'bg-[#F5F2F7] text-[#6A5A7A]',
      ring: 'hover:border-[#6A5A7A]/40 hover:shadow-[0_8px_24px_rgba(106,90,122,0.08)]',
    },
    red: {
      iconBg: 'bg-[#FBF1EE] text-[#D17A5E]',
      ring: 'hover:border-[#D17A5E]/50 hover:shadow-[0_8px_24px_rgba(209,122,94,0.08)]',
    },
  };

  const selectedColor = colorMap[accentColor] || colorMap.emerald;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`group relative p-6 rounded-[24px] bg-white border border-[#EDE8DF]/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all duration-200 ${
        onClick ? `cursor-pointer ${selectedColor.ring} active:scale-[0.99]` : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-[#8C8880] uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-serif text-[#2C362C] tracking-tight">
            {value}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${selectedColor.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-[#F5F2EC] flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-[#8C8880] font-normal text-[11px]">
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                trend.isPositive === false 
                  ? 'text-[#D17A5E] bg-[#FBF1EE]' 
                  : 'text-[#4A5D4A] bg-[#F2F6F2]'
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
