export interface Service {
  id: string;
  service_code: string;
  service_time: string;
  qr_url: string;
  attendance_count?: number;
  event_id?: string;
  created_at?: string;
}

export interface Event {
  id: string;
  name: string;
  event_date: string;
  created_at?: string;
  services: Service[];
}

export interface Attendee {
  id: string;
  full_name: string;
  phone: string;
  member_type: 'regular' | 'guest';
  check_in_time: string;
}

export interface AttendanceStats {
  total_count: number;
  regular_count: number;
  guest_count: number;
}

export interface AttendanceData {
  service: {
    id: string;
    service_code: string;
    service_time: string;
    event_name: string;
    event_date: string;
  };
  attendees: Attendee[];
  stats: AttendanceStats;
}
