// src/Admin/Components/StatsCard.jsx
import React, { useState, useEffect } from "react";

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'yellow',
  subtitle,
  delay = 0 
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  const colorClasses = {
    yellow: 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-l-4 border-yellow-500',
    orange: 'bg-gradient-to-br from-orange-100 to-orange-50 border-l-4 border-orange-500',
    amber: 'bg-gradient-to-br from-amber-100 to-amber-50 border-l-4 border-amber-500',
    gold: 'bg-gradient-to-br from-yellow-200 to-yellow-100 border-l-4 border-yellow-600',
    green: 'bg-gradient-to-br from-green-100 to-green-50 border-l-4 border-green-500',
    teal: 'bg-gradient-to-br from-teal-100 to-teal-50 border-l-4 border-teal-500',
    blue: 'bg-gradient-to-br from-blue-100 to-blue-50 border-l-4 border-blue-500',
    purple: 'bg-gradient-to-br from-purple-100 to-purple-50 border-l-4 border-purple-500',
  };

  const iconBgClasses = {
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    amber: 'bg-amber-100 text-amber-600',
    gold: 'bg-yellow-200 text-yellow-700',
    green: 'bg-green-100 text-green-600',
    teal: 'bg-teal-100 text-teal-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const isPercentage = typeof trend === 'string' && trend.includes('%');
  const isPositive = typeof trend === 'string' && trend.startsWith('+');

  return (
    <div 
      className={`${colorClasses[color]} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`h-12 w-12 rounded-xl ${iconBgClasses[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className={isPositive ? 'mr-1' : 'mr-1'}>{isPositive ? '↗' : '↘'}</span>
              {trend}
              <span className="text-gray-500 text-xs ml-1">{isPercentage ? ' vs last month' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Mini progress indicator */}
        <div className="w-16">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: isPositive ? '75%' : '30%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">{isPositive ? 'Growing' : 'Declining'}</p>
        </div>
      </div>
    </div>
  );
}