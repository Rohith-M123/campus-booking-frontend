
import { Venue, UserRole } from './types';

export const VENUES: Venue[] = [
  { id: 'v1', name: 'Main Auditorium', category: 'HALL', capacity: 1000, location: 'Block A', type: 'Auditorium', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800', equipment: ['Projector', 'PA System', 'Stage Lighting'] },
  { id: 'v2', name: 'Smart Classroom 201', category: 'ACADEMIC', capacity: 60, location: 'Academic Block', type: 'Smart Classroom', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', equipment: ['Projector', 'Smart Board'] },
  { id: 'v3', name: 'Computer Lab 1', category: 'ACADEMIC', capacity: 40, location: 'Science Wing', type: 'Laboratory', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800', equipment: ['PCs', 'LAN', 'AC'] },
  { id: 'v4', name: 'Football Ground', category: 'SPORTS', capacity: 5000, location: 'East Campus', type: 'Ground', image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800', equipment: ['Goal Posts', 'Floodlights'] },
  { id: 'v5', name: 'Basketball Court', category: 'SPORTS', capacity: 100, location: 'Sports Complex', type: 'Court', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800', equipment: ['Hoops', 'Scoreboard'] },
  { id: 'v6', name: 'Seminar Hall B', category: 'ACADEMIC', capacity: 150, location: 'Block B', type: 'Seminar Hall', image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800', equipment: ['Mic', 'Speakers', 'Podium'] },
  { id: 'v7', name: 'Gallery Hall', category: 'HALL', capacity: 250, location: 'Arts Wing', type: 'Gallery Hall', image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&q=80&w=800', equipment: ['Spotlights', 'Gallery Hanging System'] },
];

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['ALL'],
  [UserRole.FACULTY]: ['ACADEMIC', 'SPORTS'],
  [UserRole.COORDINATOR]: ['HALL', 'SPORTS']
};
