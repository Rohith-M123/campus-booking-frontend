
export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  COORDINATOR = 'COORDINATOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  status: 'ACTIVE' | 'BLOCKED';
  // isBlocked is deprecated in favor of status
}

export type VenueCategory = 'ACADEMIC' | 'HALL' | 'SPORTS';

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  capacity: number;
  location: string;
  type: string;
  image: string;
  equipment: string[];
  isBlocked?: boolean;
}

export interface Booking {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  isFullDay: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  posterUrl?: string;
  equipmentRequired: string[];
  attendees: number;
  timestamp: number;
}

export interface Slot {
  time: string;
  isAvailable: boolean;
  booking?: Booking;
}
