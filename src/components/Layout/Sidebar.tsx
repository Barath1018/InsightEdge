import React from 'react';
import { BarChart3, FileText, Settings, TrendingUp, DollarSign, AlertTriangle, Bell, HelpCircle, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full w-64 bg-indigo-800 text-white shadow-sm z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white md:hidden hover:bg-indigo-700 p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>
        
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">InsightEdge</h1>
            <p className="text-sm text-indigo-200">Business Intelligence</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center space-x-3 px-4 py-3 w-full rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-700 text-white' 
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-br from-indigo-700 to-indigo-600 rounded-lg p-4 border border-indigo-500">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-indigo-200" />
            <span className="font-medium text-white">Pro Tip</span>
          </div>
          <p className="text-sm text-indigo-200">
            Monitor your profit margins regularly to maintain healthy business growth.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;