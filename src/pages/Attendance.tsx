import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AttendeeCardSkeleton, LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { attendanceAPI } from '@/services/api';
import { AttendanceData, Attendee } from '@/types';
import { formatTime, formatDisplayDate, formatCheckInTime } from '@/utils/dateUtils';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  RefreshCw,
  Download,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'regular' | 'guest';

const Attendance: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [data, setData] = useState<AttendanceData | null>(null);
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

  const handleExportCSV = async () => {
    if (!data?.service) return;
    
    try {
      // Create CSV from current data
      const headers = ['Full Name', 'Phone', 'Member Type', 'Check-in Time'];
      const rows = filteredAttendees.map((a) => [
        a.full_name,
        a.phone,
        a.member_type,
        formatCheckInTime(a.check_in_time),
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.service.event_name}_${data.service.service_code}_attendance.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Attendance data exported successfully!');
    } catch (error) {
      toast.error('Failed to export attendance');
    }
  };

  const filteredAttendees = data?.attendees.filter((attendee) => {
    // Filter by type
    if (filter !== 'all' && attendee.member_type !== filter) return false;
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        attendee.full_name.toLowerCase().includes(query) ||
        attendee.phone.includes(query)
      );
    }
    
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-4">
            <LoadingSkeleton variant="stat" />
            <div className="grid grid-cols-3 gap-3">
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
        <Header />
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
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Service Info */}
        <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-lg">{data.service.event_name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{data.service.service_code}</span>
                <span>•</span>
                <span>{formatTime(data.service.service_time)}</span>
                <span>•</span>
                <span>{formatDisplayDate(data.service.event_date)}</span>
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

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total</span>
            </div>
            <p className="text-2xl font-bold">{data.stats.total_count}</p>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs">Regular</span>
            </div>
            <p className="text-2xl font-bold">{data.stats.regular_count}</p>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserPlus className="h-4 w-4" />
              <span className="text-xs">Guest</span>
            </div>
            <p className="text-2xl font-bold">{data.stats.guest_count}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-focus-ring"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'regular', 'guest'] as FilterType[]).map((f) => (
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
  return (
    <div
      className="bg-card rounded-lg p-4 shadow-soft animate-slide-up"
      style={style}
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-semibold text-muted-foreground">
            {attendee.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{attendee.full_name}</p>
          <p className="text-sm text-muted-foreground">{attendee.phone}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge
            variant={attendee.member_type === 'regular' ? 'default' : 'secondary'}
            className={cn(
              attendee.member_type === 'regular'
                ? 'bg-success text-success-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {attendee.member_type}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatCheckInTime(attendee.check_in_time)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
