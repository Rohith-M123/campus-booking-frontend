
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole, Booking, Venue } from './types';
import { VENUES as INITIAL_VENUES } from './constants';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Venues from './pages/Venues';
import UsersPage from './pages/Users';
import Requests from './pages/Requests';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

import api from './src/api/axios';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cutm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      setVenues(response.data);
    } catch (error) {
      console.error("Failed to fetch venues", error);
      // Removed fallback to avoid ID mismatch issues. Better to show error or empty state.
      // if (venues.length === 0) setVenues(INITIAL_VENUES);
    }
  };

  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      // Backend returns entities, need to map if structure differs significantly
      // Assuming backend follows Booking entity structure (id, bookingDate, startTime, etc.)
      const mappedBookings = response.data.map((b: any) => ({
        ...b,
        date: b.bookingDate, // Map backend 'bookingDate' to frontend 'date'
        venueId: b.venue.id.toString(), // Extract IDs from objects
        userId: b.user.id.toString(),
        userName: b.user.name,
        // Ensure other fields match
      }));
      setBookings(mappedBookings);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
  };

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Removed localStorage sync for bookings

  useEffect(() => {
    // Venues are now managed by backend, no need to sync to local storage for persistence
    // But we might want to cache them if needed. For now, rely on API.
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('cutm_all_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cutm_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cutm_user');
    localStorage.removeItem('token'); // Clear token to ensure fresh login
  };

  const addBooking = async (newBooking: Booking) => {
    try {
      // transform frontend booking to backend booking DTO structure
      const payload = {
        venue: { id: parseInt(newBooking.venueId) }, // Backend expects Long
        bookingDate: newBooking.date,
        startTime: newBooking.startTime.length === 5 ? newBooking.startTime + ":00" : newBooking.startTime, // Format HH:mm:ss
        endTime: newBooking.endTime.length === 5 ? newBooking.endTime + ":00" : newBooking.endTime,
        fullDay: newBooking.isFullDay,
        title: newBooking.title,
        description: newBooking.description,
        attendees: newBooking.attendees,
        equipmentRequired: newBooking.equipmentRequired
      };

      const response = await api.post('/bookings', payload);

      // Map response back to frontend structure
      const savedBooking = {
        ...response.data,
        date: response.data.bookingDate,
        venueId: response.data.venue.id.toString(),
        userId: response.data.user.id.toString(),
        userName: response.data.user.name
      };

      setBookings(prev => [...prev, savedBooking]);
    } catch (error) {
      console.error("Failed to add booking", error);
      alert("Failed to create booking. Please check time slots.");
      throw error; // Propagate to caller
    }
  };

  const addVenue = async (newVenue: Venue) => {
    try {
      const response = await api.post('/venues', newVenue);
      setVenues(prev => [response.data, ...prev]);
    } catch (error) {
      console.error("Failed to add venue", error);
      alert("Failed to add venue. Server might be down or you are not Admin.");
    }
  };

  const updateVenue = async (updatedVenue: Venue) => {
    try {
      const response = await api.put(`/venues/${updatedVenue.id}`, updatedVenue);
      setVenues(prev => prev.map(v => v.id === updatedVenue.id ? response.data : v));
    } catch (error) {
      console.error("Failed to update venue", error);
      alert("Failed to update venue.");
    }
  };

  const toggleUserBlock = async (id: string) => {
    try {
      const response = await api.put(`/users/${id}/block`);
      setUsers(prev => prev.map(u => u.id.toString() === id.toString() ? response.data : u));
    } catch (error) {
      console.error("Failed to toggle user block", error);
      alert("Failed to update user status.");
    }
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const updateBookingStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      let response;
      if (status === 'APPROVED') {
        response = await api.put(`/bookings/${id}/approve`);
      } else {
        response = await api.put(`/bookings/${id}/reject`);
      }

      // Update local state with the returned updated booking
      setBookings(prev => prev.map(b =>
        b.id.toString() === id.toString() ? {
          ...b,
          status: response.data.status // Use status from backend response
        } : b
      ));
    } catch (error) {
      console.error("Failed to update booking status", error);
      alert("Failed to update booking status. Check console.");
    }
  };

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {!user ? (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar user={user} bookings={bookings} onLogout={handleLogout} />
            <div className="flex-1 flex flex-col min-w-0">
              <Header
                user={user}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              />
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard user={user} venues={venues} bookings={bookings} updateBookingStatus={updateBookingStatus} />} />
                  <Route path="/bookings" element={<Bookings user={user} venues={venues} bookings={bookings} onAddBooking={addBooking} />} />
                  <Route path="/venues" element={<Venues user={user} venues={venues} onAddVenue={addVenue} onUpdateVenue={updateVenue} />} />
                  <Route path="/requests" element={user.role === UserRole.ADMIN ? <Requests bookings={bookings} venues={venues} onUpdateStatus={updateBookingStatus} /> : <Navigate to="/dashboard" />} />
                  <Route path="/users" element={user.role === UserRole.ADMIN ? <UsersPage users={users} onToggleBlock={toggleUserBlock} onAddUser={addUser} /> : <Navigate to="/dashboard" />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

export default App;
