
import React, { useState } from 'react';
import { User, UserRole, Venue, VenueCategory } from '../types';
import {
  MapPin,
  Search,
  Plus,
  MoreVertical,
  Users,
  Tv,
  Wind,
  Layers,
  Star,
  X,
  Image as ImageIcon,
  Building,
  Edit2
} from 'lucide-react';

interface VenuesProps {
  user: User;
  venues: Venue[];
  onAddVenue: (venue: Venue) => void;
  onUpdateVenue: (venue: Venue) => void;
}

const Venues: React.FC<VenuesProps> = ({ user, venues, onAddVenue, onUpdateVenue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVenueImage, setNewVenueImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'ACADEMIC' as VenueCategory,
    capacity: 60,
    location: '',
    type: '',
    equipment: [] as string[]
  });

  const filteredVenues = venues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'ALL' || v.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Max size is 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVenueImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'ACADEMIC',
      capacity: 60,
      location: '',
      type: '',
      equipment: []
    });
    setNewVenueImage(null);
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleEditClick = (venue: Venue) => {
    setFormData({
      name: venue.name,
      category: venue.category,
      capacity: venue.capacity,
      location: venue.location,
      type: venue.type,
      equipment: venue.equipment || []
    });
    setNewVenueImage(venue.image);
    setEditingId(venue.id);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleAddVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && editingId) {
      const updatedVenue: Venue = {
        id: editingId,
        ...formData,
        image: newVenueImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        isBlocked: false
      };
      onUpdateVenue(updatedVenue);
    } else {
      const newVenue: Venue = {
        id: '', // Backend will assign ID, but we need type validation. In API call we ignore this.
        ...formData,
        image: newVenueImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
        isBlocked: false
      };
      onAddVenue(newVenue);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const toggleEquipment = (eq: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter(e => e !== eq)
        : [...prev.equipment, eq]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Campus Venues</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Explore {venues.length} world-class facilities at Vizianagaram.</p>
        </div>
        {user.role === UserRole.ADMIN && (
          <button
            onClick={() => { resetForm(); setIsAddModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
            Add New Venue
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search by venue name, location, or type..."
            className="w-full pl-12 pr-4 py-4 glass rounded-3xl border-none focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-[1.5rem] self-start">
          {['ALL', 'ACADEMIC', 'HALL', 'SPORTS'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-[1.25rem] text-xs font-bold transition-all ${activeTab === tab
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="glass group rounded-[2.5rem] overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="h-56 relative overflow-hidden shrink-0">
              <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${venue.category === 'ACADEMIC' ? 'bg-blue-500/80 border-blue-400 text-white' :
                    venue.category === 'SPORTS' ? 'bg-emerald-500/80 border-emerald-400 text-white' :
                      'bg-purple-500/80 border-purple-400 text-white'
                  }`}>
                  {venue.category}
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{venue.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium">
                    <MapPin size={12} />
                    {venue.location}
                  </div>
                </div>
                {user.role === UserRole.ADMIN && (
                  <button
                    onClick={() => handleEditClick(venue)}
                    className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Edit Venue"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
              </div>

              <div className="flex gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                    <Users size={16} />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    <p className="leading-none text-slate-900 dark:text-white mb-0.5">{venue.capacity}</p>
                    CAPACITY
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                    <Layers size={16} />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500">
                    <p className="leading-none text-slate-900 dark:text-white mb-0.5">{venue.type}</p>
                    TYPE
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {venue.equipment && venue.equipment.slice(0, 3).map((eq, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400" title={eq}>
                      {eq.includes('Projector') ? <Tv size={14} /> : <Wind size={14} />}
                    </div>
                  ))}
                </div>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{isEditMode ? 'Edit Venue' : 'Add New Venue'}</h3>
                  <p className="text-slate-500 text-sm">{isEditMode ? 'Update existing details' : 'Create a new listing'}</p>
                </div>
              </div>
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <form onSubmit={handleAddVenueSubmit} className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Venue Photo</label>
                  <div className={`relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 text-center transition-all h-64 flex items-center justify-center overflow-hidden ${newVenueImage ? 'border-indigo-500' : 'hover:border-indigo-400 group'}`}>
                    {newVenueImage ? (
                      <div className="w-full h-full relative">
                        <img src={newVenueImage} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                        <button type="button" onClick={() => setNewVenueImage(null)} className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl text-red-500 shadow-lg">
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="venue-image-upload" className="cursor-pointer flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                          <ImageIcon size={32} />
                        </div>
                        <p className="font-bold">Upload venue photo</p>
                        <p className="text-xs text-slate-500 mt-1">Click to browse (Max 5MB)</p>
                      </label>
                    )}
                    <input type="file" id="venue-image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Name</label>
                    <input required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Category</label>
                    <select className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as VenueCategory })}>
                      <option value="ACADEMIC">Academic</option>
                      <option value="HALL">Hall / Auditorium</option>
                      <option value="SPORTS">Sports</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Capacity</label>
                    <input required type="number" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Type</label>
                    <input required placeholder="e.g. Lab, Ground" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Location</label>
                  <input required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-500" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Equipment</label>
                  <div className="flex flex-wrap gap-2">
                    {['Projector', 'Smart Board', 'Audio System', 'AC', 'WiFi', 'PCs', 'Stage', 'Lighting'].map(eq => (
                      <button key={eq} type="button" onClick={() => toggleEquipment(eq)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.equipment.includes(eq) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>{eq}</button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-[0.98]">
                  {isEditMode ? 'Update Venue' : 'Create Venue Listing'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venues;
