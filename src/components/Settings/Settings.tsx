import React, { useState } from 'react';
import { Bell, User, Shield, Mail } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'email'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@business.com',
    phone: '+1 234 567 890',
    company: 'Acme Business Solutions',
    department: 'Finance',
    role: 'Admin',
    industry: 'Technology',
    currency: 'USD ($)',
    timezone: 'UTC',
  });

  const menuItems = [
    { key: 'profile', icon: User, label: 'Profile' },
    { key: 'notifications', icon: Bell, label: 'Notifications' },
    { key: 'security', icon: Shield, label: 'Security' },
    { key: 'email', icon: Mail, label: 'Email' },
  ];

  const handleChange = (field: keyof typeof profileData, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleSave = () => {
    console.log('Saved profile data:', profileData);
    setIsEditing(false);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your dashboard preferences and account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Menu */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Settings Categories</h3>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key as typeof activeTab);
                    setIsEditing(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === item.key
                      ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <div className="card space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                {!isEditing && (
                  <button
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h4>
                  <p className="text-sm text-gray-600">{profileData.role}</p>
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['firstName', 'lastName', 'email', 'phone'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.replace(/^\w/, (c) => c.toUpperCase()).replace(/([A-Z])/g, ' $1')}
                    </label>
                    {isEditing ? (
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        value={profileData[field as keyof typeof profileData]}
                        onChange={(e) => handleChange(field as keyof typeof profileData, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData[field as keyof typeof profileData]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['company', 'department'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.replace(/^\w/, (c) => c.toUpperCase())}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData[field as keyof typeof profileData]}
                        onChange={(e) => handleChange(field as keyof typeof profileData, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData[field as keyof typeof profileData]}</p>
                    )}
                  </div>
                ))}

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  {isEditing ? (
                    <select
                      value={profileData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option>Admin</option>
                      <option>Analyst</option>
                      <option>Viewer</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.role}</p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  {isEditing ? (
                    <select
                      value={profileData.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option>Technology</option>
                      <option>Retail</option>
                      <option>Services</option>
                      <option>Manufacturing</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.industry}</p>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Currency</label>
                  {isEditing ? (
                    <select
                      value={profileData.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>CAD ($)</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.currency}</p>
                  )}
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  {isEditing ? (
                    <select
                      value={profileData.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option>UTC</option>
                      <option>GMT</option>
                      <option>EST</option>
                      <option>PST</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profileData.timezone}</p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div> 
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Security Settings</h3>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Email Settings</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
