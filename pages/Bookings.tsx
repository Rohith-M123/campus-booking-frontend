
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, Booking, Venue } from '../types';
import { TIME_SLOTS } from '../constants';
import { getSlotSuggestions } from '../geminiService';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
  Sparkles,
  Search,
  CheckCircle,
  X,
  Upload,
  Clock,
  AlertCircle
} from 'lucide-react';

interface BookingsProps {
  user: User;
  venues: Venue[];
  bookings: Booking[];
  onAddBooking: (booking: Booking) => Promise<void>;
}

const Bookings: React.FC<BookingsProps> = ({ user, venues, bookings, onAddBooking }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    isFullDay: false,
    attendees: 50,
    equipment: [] as string[],
    poster: null as File | null
  });

  const venueSlots = useMemo(() => {
    return venues.map(venue => {
      const slots = TIME_SLOTS.map(time => {
        const booking = bookings.find(b =>
          b.venueId === venue.id &&
          b.date === selectedDate &&
          b.status === 'APPROVED' &&
          (b.isFullDay || (time >= b.startTime && time < b.endTime))
        );
        return { time, isAvailable: !booking, booking };
      });
      return { venue, slots };
    });
  }, [selectedDate, bookings, venues]);

  const handleFetchAISuggestions = async () => {
    if (!selectedVenue) return;
    setIsLoadingAI(true);
    const venueBookings = bookings.filter(b => b.venueId === selectedVenue.id && b.date === selectedDate);
    const suggestions = await getSlotSuggestions(selectedDate, selectedVenue, venueBookings, formData.title || "Academic Event");
    setAiSuggestions(suggestions);
    setIsLoadingAI(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue) return;

    // Logic handled by backend now
    const newBooking: any = {
      venueId: selectedVenue.id,
      title: formData.title,
      description: formData.description,
      date: selectedDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      isFullDay: formData.isFullDay,
      equipmentRequired: formData.equipment,
      attendees: formData.attendees,
    };

    onAddBooking(newBooking).then(() => {
      setIsModalOpen(false);
      // Show confirmation for non-admin
      if (user.role !== UserRole.ADMIN) {
        setShowSuccessModal(true);
      }
      resetForm();
    }).catch((err) => {
      // Error handled in App.tsx (alert)
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      isFullDay: false,
      attendees: 50,
      equipment: [],
      poster: null
    });
    setAiSuggestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="glass p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Venue Schedule</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Check availability and book slots</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-center w-36 px-2"
          />
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Booking Grid */}
      <div className="glass overflow-hidden rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-8 py-5 text-left border-r dark:border-slate-800">Venue / Time</th>
                {TIME_SLOTS.map(time => (
                  <th key={time} className="px-4 py-5 text-center min-w-[100px]">{time}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {venueSlots.map(({ venue, slots }) => (
                <tr key={venue.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6 border-r dark:border-slate-800">
                    <div className="font-bold text-sm">{venue.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{venue.type} • Cap: {venue.capacity}</div>
                  </td>
                  {slots.map((slot, i) => (
                    <td key={i} className="p-1">
                      {slot.isAvailable ? (
                        <button
                          onClick={() => {
                            setSelectedVenue(venue);
                            setFormData(prev => ({ ...prev, startTime: slot.time }));
                            setIsModalOpen(true);
                          }}
                          className="w-full h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/20 hover:border-emerald-400 transition-all group"
                        >
                          <Plus size={16} className="opacity-0 group-hover:opacity-100" />
                        </button>
                      ) : (
                        <div className="w-full h-12 rounded-xl bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 flex items-center justify-center cursor-not-allowed group relative">
                          <Info size={16} className="opacity-40" />
                          <div className="absolute bottom-full mb-2 hidden group-hover:block z-50 glass p-3 rounded-xl shadow-xl w-48 text-left border border-rose-200">
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{slot.booking?.title}</p>
                            <p className="text-[10px] text-slate-500">Booked by {slot.booking?.userName}</p>
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 text-center shadow-2xl space-y-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 mx-auto animate-bounce">
              <Clock size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Request Sent to Admin</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Your request to occupy the venue is currently <span className="font-bold text-amber-600">on hold</span>.
                You will be notified once the admin reviews and approves your booking.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95"
            >
              Understand
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isModalOpen && selectedVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">New Booking</h3>
                  <p className="text-slate-500 text-sm">{selectedVenue.name} • {selectedDate}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Note about admin approval */}
              {user.role !== UserRole.ADMIN && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl text-amber-700 dark:text-amber-400">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">Note: Your booking will require Admin approval before it is finalized.</p>
                </div>
              )}

              {/* AI Suggestions Box */}
              <div className="glass-inner bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Sparkles size={18} />
                    <span className="font-bold text-sm">AI Slot Assistant</span>
                  </div>
                  <button
                    onClick={handleFetchAISuggestions}
                    disabled={isLoadingAI}
                    className="text-xs font-bold bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {isLoadingAI ? 'Analyzing...' : 'Analyze Best Slots'}
                  </button>
                </div>
                {aiSuggestions.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {aiSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFormData({ ...formData, startTime: s.time })}
                        className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/20 text-left hover:border-indigo-400 transition-all group"
                      >
                        <p className="font-bold text-indigo-600">{s.time}</p>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{s.reason}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">I can suggest the best times based on your event title and existing schedule.</p>
                )}
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Event Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Guest Lecture on AI"
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Expected Attendees</label>
                    <input
                      type="number"
                      className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      value={formData.attendees}
                      onChange={e => setFormData({ ...formData, attendees: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief details about the event..."
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Start Time</label>
                    <select
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.startTime}
                      onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">End Time</label>
                    <select
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.endTime}
                      onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    >
                      {TIME_SLOTS.filter(t => t > formData.startTime).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        checked={formData.isFullDay}
                        onChange={e => setFormData({ ...formData, isFullDay: e.target.checked })}
                      />
                      <span className="text-sm font-bold">Full Day</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Required Equipment</label>
                  <div className="flex flex-wrap gap-2">
                    {['Projector', 'Microphone', 'Sound System', 'AC', 'Whiteboard', 'PC', 'Lab Kits'].map(eq => (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => {
                          const newEq = formData.equipment.includes(eq)
                            ? formData.equipment.filter(e => e !== eq)
                            : [...formData.equipment, eq];
                          setFormData({ ...formData, equipment: newEq });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.equipment.includes(eq)
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer group">
                  <input type="file" className="hidden" id="poster-upload" />
                  <label htmlFor="poster-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <Upload size={32} />
                    </div>
                    <p className="font-bold">Upload Event Poster</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG or PDF up to 10MB</p>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-2xl transition-all transform active:scale-[0.98]"
                >
                  {user.role === UserRole.ADMIN ? 'Create Booking' : 'Submit Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
