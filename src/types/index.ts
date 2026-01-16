export interface Service {
  id: string;
  service_code: string;
  service_time: string;
  qrUrl: string;
}

export interface Event {
  id: string;
  name: string;
  event_date: string;
  total_attendees?: string;
  services: Service[];
}

export interface Attendee {
  id: string;
  church_id: string;
  phone: string;
  full_name: string;
  email: string;
  created_at: string;
  last_updated: string;
  coming_from: string;
  member_type: 'regular' | 'guest' | 'online viewer';
  attending_with: string;
  since_year: number;
  gender: string;
  baptised: boolean;
  baptised_year: string;
  submitted_at: string;
  prayer_request?: string;
}

export interface AttendanceStats {
  total_count: number;
  regular_count: number;
  guest_count: number;
  online_count: number;
}

export interface AttendanceData {
  count: number;
  attendees: Attendee[];
}
