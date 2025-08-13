import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../data/mockData';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  icon: LucideIcon;
  type: 'currency' | 'percentage';
  variant: 'success' | 'primary' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  type,
  variant,
}) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-success-600';
    if (change < 0) return 'text-error-600';
    return 'text-gray-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className={`metric-card ${variant} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {type === 'currency' ? formatCurrency(value) : formatPercentage(value)}
          </p>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${getChangeColor(change)}`}>
              <span className="mr-1">{getChangeIcon(change)}</span>
              <span className="font-medium">
                {type === 'currency' ? formatCurrency(Math.abs(change)) : formatPercentage(Math.abs(change))}
              </span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          variant === 'success' ? 'bg-success-100' :
          variant === 'primary' ? 'bg-primary-100' :
          variant === 'warning' ? 'bg-warning-100' :
          'bg-error-100'
        }`}>
          <Icon className={`w-6 h-6 ${
            variant === 'success' ? 'text-success-600' :
            variant === 'primary' ? 'text-primary-600' :
            variant === 'warning' ? 'text-warning-600' :
            'text-error-600'
          }`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;