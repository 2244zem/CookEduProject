import React, { useState } from 'react';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

export default function SmartWeatherDashboard() {
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');

  return (
    <div className="min-h-screen bg-[#FAF9F6] transition-all duration-300">
      {currentView === 'user' ? (
        <UserDashboard onSwitchView={setCurrentView} />
      ) : (
        <AdminDashboard onSwitchView={setCurrentView} />
      )}
    </div>
  );
}
