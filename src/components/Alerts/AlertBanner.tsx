import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { Alert } from '../../types';

interface AlertBannerProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
  const getIcon = () => {
    switch (alert.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertClass = () => {
    switch (alert.type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      default:
        return 'alert-warning';
    }
  };

  return (
    <div className={`${getAlertClass()} animate-slide-up ${alert.type === 'error' ? 'animate-pulse' : ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-medium">{alert.title}</h3>
          <p className="mt-1 text-sm opacity-90">{alert.message}</p>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className="flex-shrink-0 ml-4 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;