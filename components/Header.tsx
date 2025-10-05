import React from 'react';
import { useAuth } from '../contexts/AuthContext';


const Header: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <header className="flex-shrink-0 h-20 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/60 flex items-center justify-between px-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Welcome, Commander {user?.name || 'Guest'}! 👋</h1>
        <p className="text-sm text-gray-400">Mission parameters: Monitor air quality and maintain peak performance.</p>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <svg className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
        </div>
        <div className="flex items-center">
            <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.name || 'A'}`} alt={user?.name} className="w-11 h-11 rounded-full object-cover border-2 border-gray-600 bg-gray-700"/>
            <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;