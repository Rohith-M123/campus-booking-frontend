
import React, { useState } from 'react';
import { Booking, Venue, UserRole } from '../types';
import { Check, X, Clock, Calendar, MapPin, User as UserIcon, Info } from 'lucide-react';

interface RequestsProps {
  bookings: Booking[];
  venues: Venue[];
  onUpdateStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const Requests: React.FC<RequestsProps> = ({ bookings, venues, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  const filteredBookings = bookings.filter(b => 
    filter === 'ALL' ? true : b.status === 'PENDING'
  ).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Booking Requests</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage venue booking permissions across campus.</p>
        </div>
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[1.5rem]">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-5 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all ${
              filter === 'PENDING' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-5 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all ${
              filter === 'ALL' 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBookings.length === 0 ? (
          <div className="glass p-20 rounded-[3rem] text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 mx-auto mb-6">
              <Clock size={40} />
            </div>
            <h3 className="text-xl font-bold">No {filter === 'PENDING' ? 'Pending' : ''} Requests</h3>
            <p className="text-slate-500 mt-2">All booking requests have been processed.</p>
          </div>
        ) : (
          filteredBookings.map((b) => {
            const venue = venues.find(v => v.id === b.venueId);
            return (
              <div key={b.id} className="glass p-6 md:p-8 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-xl transition-all border border-transparent hover:border-indigo-100 group">
                <div className="flex flex-col md:flex-row gap-6 lg:flex-1">
                  <div className="w-full md:w-32 h-24 rounded-[1.5rem] overflow-hidden shrink-0">
                    <img src={venue?.image} alt={venue?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                        b.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-rose-100 text-rose-600'
                      }`}>
                        {b.status}
                      </span>
                      <h4 className="text-lg font-bold">{b.title}</h4>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{b.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <UserIcon size={14} className="text-indigo-500" />
                        {b.userName}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-indigo-500" />
                        {venue?.name}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-500" />
                        {b.date} ({b.startTime} - {b.endTime})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {b.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => onUpdateStatus(b.id, 'REJECTED')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-all border border-rose-100"
                      >
                        <X size={18} />
                        Reject
                      </button>
                      <button
                        onClick={() => onUpdateStatus(b.id, 'APPROVED')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                    </>
                  ) : (
                    <div className="text-slate-400 font-bold text-sm italic">
                      Processed on {new Date(b.timestamp).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Requests;
