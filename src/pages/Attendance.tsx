import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AttendeeCardSkeleton, LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { attendanceAPI, eventAPI } from '@/services/api';
import { AttendanceData, Attendee, Service } from '@/types';
import { formatTime, formatDisplayDate } from '@/utils/dateUtils';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  Download,
  Timer,
  Monitor,
  Mail,
  MapPin,
  Calendar,
  UserCircle,
  Droplets,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'regular' | 'guest' | 'online';

const Attendance: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [data, setData] = useState<AttendanceData | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAttendance = useCallback(async (showRefreshing = false) => {
    if (!serviceId) return;
    
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await attendanceAPI.getByService(serviceId);
      setData(response.data);
      
      // Fetch service details
      const eventsResponse = await eventAPI.getAll();
      for (const event of eventsResponse.data) {
        const foundService = event.services.find((s: Service) => s.id === serviceId);
        if (foundService) {
          setService(foundService);
          setEventName(event.name);
          setEventDate(event.event_date);
          break;
        }
      }
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchAttendance(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAttendance]);

  // Calculate stats based on member_type
  const calculateStats = () => {
    if (!data?.attendees) return { total: 0, regular: 0, guest: 0, online: 0, baptised: 0 };
    
    const regular = data.attendees.filter((a) => a.member_type.toString().includes('regular')).length;
    const guest = data.attendees.filter((a) => a.member_type.toString().includes('guest')).length;
    const online = data.attendees.filter((a) => a.member_type.toString().includes('online')).length;
    const baptised = data.attendees.filter((a) => a.baptised === true).length;
    
    return {
      total: data.attendees.length,
      regular,
      guest,
      online,
      baptised,
    };
  };

  const stats = calculateStats();

  const handleExportCSV = async () => {
    if (!data) return;
    
    try {
      const headers = ['Full Name', 'Phone', 'Email', 'Member Type', 'Coming From', 'Attending With', 'Gender', 'Since Year', 'Baptised', 'Baptised Year', 'Submitted At', 'Prayer Request'];
      const rows = filteredAttendees.map((a) => [
        a.full_name,
        a.phone,
        a.email || '',
        a.member_type,
        a.coming_from || '',
        a.attending_with || '',
        a.gender || '',
        a.since_year?.toString() || '',
        a.baptised ? 'Yes' : 'No',
        a.baptised_year || '',
        new Date(a.submitted_at).toLocaleString(),
        a.prayer_request || 'No prayer request',
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventName}_${service?.service_code}_attendance.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Attendance data exported successfully!');
    } catch (error) {
      toast.error('Failed to export attendance');
    }
  };

  const filteredAttendees = data?.attendees.filter((attendee) => {
    // Filter by type
    if (filter !== 'all') {
      const memberType = attendee.member_type.toLowerCase();
      if (!memberType.includes(filter)) return false;
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        attendee.full_name.toLowerCase().includes(query) ||
        attendee.phone.includes(query) ||
        attendee.email?.toLowerCase().includes(query) ||
        attendee.coming_from?.toLowerCase().includes(query)
      );
    }
    
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-4">
            <LoadingSkeleton variant="stat" />
            <div className="grid grid-cols-5 gap-3">
              <LoadingSkeleton variant="stat" />
              <LoadingSkeleton variant="stat" />
              <LoadingSkeleton variant="stat" />
              <LoadingSkeleton variant="stat" />
              <LoadingSkeleton variant="stat" />
            </div>
            <AttendeeCardSkeleton />
            <AttendeeCardSkeleton />
            <AttendeeCardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Service not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Service Info */}
        {service && (
          <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-lg">{eventName}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>{service.service_code}</span>
                  <span>•</span>
                  <span>{formatTime(service.service_time)}</span>
                  <span>•</span>
                  <span>{formatDisplayDate(eventDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {autoRefresh && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Timer className="h-3 w-3 mr-1 animate-pulse-soft" />
                    Auto
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchAttendance(true)}
                  disabled={refreshing}
                >
                  <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs">Regular</span>
            </div>
            <p className="text-2xl font-bold">{stats.regular}</p>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserPlus className="h-4 w-4" />
              <span className="text-xs">Guest</span>
            </div>
            <p className="text-2xl font-bold">{stats.guest}</p>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Monitor className="h-4 w-4" />
              <span className="text-xs">Online</span>
            </div>
            <p className="text-2xl font-bold">{stats.online}</p>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplets className="h-4 w-4" />
              <span className="text-xs">Baptised</span>
            </div>
            <p className="text-2xl font-bold">{stats.baptised}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-focus-ring"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'regular', 'guest', 'online'] as FilterType[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  filter === f && 'warm-gradient hover:opacity-90'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Export Button */}
        {data.attendees.length > 0 && (
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="w-full mb-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV ({filteredAttendees.length} attendees)
          </Button>
        )}

        {/* Attendees List */}
        {filteredAttendees.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-card">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {data.attendees.length === 0 ? 'No attendees yet' : 'No matching attendees'}
            </h3>
            <p className="text-muted-foreground">
              {data.attendees.length === 0
                ? 'Attendees will appear here when they check in.'
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAttendees.map((attendee, index) => (
              <AttendeeCard
                key={attendee.id}
                attendee={attendee}
                style={{ animationDelay: `${index * 30}ms` }}
              />
            ))}
          </div>
        )}

        {/* Auto-refresh toggle */}
        <div className="flex items-center justify-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-muted-foreground"
          >
            <Timer className="h-4 w-4 mr-2" />
            Auto-refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
        </div>
      </main>
    </div>
  );
};

interface AttendeeCardProps {
  attendee: Attendee;
  style?: React.CSSProperties;
}

const AttendeeCard: React.FC<AttendeeCardProps> = ({ attendee, style }) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'regular':
        return 'bg-success text-success-foreground';
      case 'guest':
        return 'bg-muted text-muted-foreground';
      case 'online':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div
      className="bg-card rounded-lg p-4 shadow-soft animate-slide-up border border-border/50"
      style={style}
    >
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-semibold text-muted-foreground">
            {attendee.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{attendee.full_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{attendee.phone}</span>
              </div>
            </div>
            <Badge
              variant="default"
              className={cn(getBadgeColor(attendee.member_type))}
            >
              {attendee.member_type}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {attendee.email && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{attendee.email}</span>
              </div>
            )}
            {attendee.coming_from && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{attendee.coming_from}</span>
              </div>
            )}
            {attendee.since_year && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Since {attendee.since_year}</span>
              </div>
            )}
            {attendee.gender && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <UserCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="capitalize">{attendee.gender}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            {attendee.attending_with && (
              <span>With: {attendee.attending_with}</span>
            )}
            {attendee.baptised && (
              <span>Baptised: {attendee.baptised_year || 'Yes'}</span>
            )}
            <span className="ml-auto">
              {new Date(attendee.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Prayer Request */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-start gap-1.5 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-muted-foreground font-medium">Prayer Request: </span>
                <span className="text-muted-foreground">
                  {attendee.prayer_request || 'No prayer request'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
