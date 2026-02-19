
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, UserRole, Booking } from '../types';
import {
  LayoutDashboard,
  CalendarCheck,
  MapPin,
  Users,
  LogOut,
  BellRing,
  School
} from 'lucide-react';

interface SidebarProps {
  user: User;
  bookings?: Booking[];
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, bookings = [], onLogout }) => {
  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;

  // Fix: Explicitly typed links array to allow for the optional 'badge' property used in admin links
  const links: Array<{ to: string; label: string; icon: any; badge?: number }> = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/bookings', label: 'My Bookings', icon: CalendarCheck },
    { to: '/venues', label: 'Venues', icon: MapPin },
  ];

  if (user.role === UserRole.ADMIN) {
    links.push({ to: '/requests', label: 'Requests', icon: BellRing, badge: pendingCount });
    links.push({ to: '/users', label: 'Manage Users', icon: Users });
  }

  return (
    <div className="w-64 glass hidden md:flex flex-col h-full border-r border-slate-200 dark:border-slate-800 transition-all">
      <div className="p-6 flex items-center gap-3">
        <div className="flex items-center justify-center w-full">
          <img src="/cutm logo.png" alt="Centurion University" className="h-16 w-auto object-contain" />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}
            `}
          >
            <div className="flex items-center gap-3">
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </div>
            {link.badge !== undefined && link.badge > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;