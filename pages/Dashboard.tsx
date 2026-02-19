
import React, { useMemo } from 'react';
import { User, UserRole, Booking, Venue } from '../types';
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DashboardProps {
  user: User;
  venues: Venue[];
  bookings: Booking[];
  updateBookingStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, venues, bookings, updateBookingStatus }) => {
  const isAdmin = user.role === UserRole.ADMIN;

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalVenues: venues.length,
      totalBookings: bookings.length,
      todayBookings: bookings.filter(b => b.date === today).length,
      pendingApprovals: bookings.filter(b => b.status === 'PENDING').length,
      approvedRate: Math.round((bookings.filter(b => b.status === 'APPROVED').length / (bookings.length || 1)) * 100)
    };
  }, [bookings, venues]);

  const chartData = useMemo(() => {
    // Generate dates for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0], // YYYY-MM-DD
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }) // Mon, Tue...
      };
    });

    // Aggregate data
    return last7Days.map(({ dateStr, dayName }) => {
      const dayBookings = bookings.filter(b => b.date === dateStr);
      return {
        name: dayName,
        bookings: dayBookings.length,
        attendance: dayBookings.reduce((sum, b) => sum + (b.attendees || 0), 0)
      };
    });
  }, [bookings]);

  const venueUsage = useMemo(() => {
    // Dynamically calculate usage based on current venues
    const categories = Array.from(new Set(venues.map(v => v.category)));
    return categories.map((cat: string) => ({
      name: cat.charAt(0) + cat.slice(1).toLowerCase(),
      value: bookings.filter(b => venues.find(v => v.id === b.venueId)?.category === cat).length
    })).filter(v => v.value > 0);
  }, [bookings, venues]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];
  const pendingBookings = bookings.filter(b => b.status === 'PENDING').slice(0, 5);

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(20);
    doc.text('Campus Booking Report', 20, 20);

    // Add Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Add Stats Summary
    doc.setFontSize(14);
    doc.text('Summary Statistics', 20, 45);
    doc.setFontSize(10);
    doc.text(`Total Bookings: ${stats.totalBookings}`, 20, 55);
    doc.text(`Today's Bookings: ${stats.todayBookings}`, 20, 60);
    doc.text(`Pending Approvals: ${stats.pendingApprovals}`, 20, 65);
    doc.text(`Approval Rate: ${stats.approvedRate}%`, 20, 70);

    // Add Recent Bookings Table
    doc.setFontSize(14);
    doc.text('Recent Bookings', 20, 85);

    const tableColumn = ["ID", "Event Title", "Venue", "User", "Date", "Status"];
    const tableRows = bookings.slice(0, 50).map(b => [
      b.id,
      b.title,
      venues.find(v => v.id === b.venueId)?.name || 'Unknown',
      b.userName,
      b.date,
      b.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
    });

    doc.save('campus_booking_report.pdf');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening at the Vizianagaram campus today.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <FileText size={18} />
            Export Data
          </button>
          {isAdmin && (
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              <AlertCircle size={18} />
              Emergency Lock
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Venues', val: stats.totalVenues, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: "Today's Bookings", val: stats.todayBookings, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100' },
          { label: 'Pending Approvals', val: stats.pendingApprovals, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Approved Rate', val: `${stats.approvedRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] flex items-center gap-5 group hover:scale-[1.02] transition-transform">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Booking Trends</h3>
            <select className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Venue Distribution */}
        <div className="glass p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-bold mb-8">Venue Usage</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={venueUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {venueUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-4">
            {venueUsage.map((usage, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{usage.name}</span>
                </div>
                <span className="text-sm font-bold">{usage.value} bookings</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent / Pending Actions Table */}
      <div className="glass overflow-hidden rounded-[2.5rem]">
        <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xl font-bold">Pending Approvals</h3>
          <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">Venue</th>
                <th className="px-8 py-5">Requested By</th>
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-500 font-medium">No pending requests found.</td>
                </tr>
              ) : (
                pendingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 dark:text-white">{b.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{b.description}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {venues.find(v => v.id === b.venueId)?.name}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold uppercase">
                          {b.userName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{b.userName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-semibold">{b.date}</div>
                      <div className="text-xs text-slate-500">{b.startTime} - {b.endTime}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => updateBookingStatus(b.id, 'APPROVED')}
                          className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-colors"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'REJECTED')}
                          className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
