
import React from 'react';
import { User } from '../types';
import { Bell, Moon, Sun, Search, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: User;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isDarkMode, toggleDarkMode }) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
      <div className="relative w-96 hidden lg:block">
        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search venues, bookings..." 
          className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-slate-500 font-medium">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
            <UserIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
