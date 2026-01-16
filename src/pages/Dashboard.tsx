import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EventCardSkeleton } from '@/components/ui/loading-skeleton';
import { eventAPI } from '@/services/api';
import { Event, Service } from '@/types';
import { formatDisplayDate, formatDateForAPI, formatTime } from '@/utils/dateUtils';
import { toast } from 'sonner';
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  QrCode,
  Users,
  Trash2,
  Download,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchEvents = async (date: Date) => {
    setLoading(true);
    try {
      const response = await eventAPI.getByDate(formatDateForAPI(date));
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) setSelectedDate(date);
  };

  const handlePrevDay = () => setSelectedDate((d) => subDays(d, 1));
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1));
  const handleToday = () => setSelectedDate(new Date());

  const handleDeleteEvent = async () => {
    if (!deleteEventId) return;
    try {
      await eventAPI.delete(deleteEventId);
      toast.success('Event deleted successfully');
      fetchEvents(selectedDate);
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setDeleteEventId(null);
    }
  };

  const copyQRUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('QR URL copied to clipboard!');
  };

  const getTimeCategory = (time: string): string => {
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Date Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>

          <Button
            onClick={() => navigate('/create-event')}
            className="warm-gradient hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Selected Date Display */}
        <h2 className="text-xl font-semibold mb-6">{formatDisplayDate(selectedDate)}</h2>

        {/* Events List */}
        {loading ? (
          <div className="space-y-4">
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-card">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
            <p className="text-muted-foreground mb-6">
              Create an event to get started with attendance tracking.
            </p>
            <Button onClick={() => navigate('/create-event')} className="warm-gradient">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-card rounded-xl shadow-card overflow-hidden animate-fade-in">
                {/* Event Header */}
                <div className="p-5 border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDisplayDate(event.event_date)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteEventId(event.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Services List */}
                <div className="p-5 space-y-3">
                  {event.services.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="mb-3">No services added yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/create-service/${event.id}`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                  ) : (
                    event.services.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        eventName={event.name}
                        onViewQR={() => navigate(`/qr/${service.id}`)}
                        onViewAttendance={() => navigate(`/attendance/${service.id}`)}
                        onCopyURL={() => copyQRUrl(service.qr_url)}
                        timeCategory={getTimeCategory(service.service_time)}
                      />
                    ))
                  )}
                  
                  {event.services.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/create-service/${event.id}`)}
                      className="w-full mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Service
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEventId} onOpenChange={() => setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This will also delete all associated services and attendance records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface ServiceCardProps {
  service: Service;
  eventName: string;
  onViewQR: () => void;
  onViewAttendance: () => void;
  onCopyURL: () => void;
  timeCategory: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onViewQR,
  onViewAttendance,
  onCopyURL,
  timeCategory,
}) => {
  const categoryColors = {
    morning: 'bg-amber-100 border-amber-200 text-amber-800',
    afternoon: 'bg-blue-100 border-blue-200 text-blue-800',
    evening: 'bg-purple-100 border-purple-200 text-purple-800',
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'px-2 py-1 rounded text-xs font-medium border',
              categoryColors[timeCategory as keyof typeof categoryColors]
            )}
          >
            {service.service_code}
          </span>
          <span className="font-medium">{formatTime(service.service_time)}</span>
          {service.attendance_count !== undefined && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              {service.attendance_count}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewQR}>
            <QrCode className="h-4 w-4 mr-1" />
            QR
          </Button>
          <Button variant="outline" size="sm" onClick={onViewAttendance}>
            <Users className="h-4 w-4 mr-1" />
            Attendance
          </Button>
          <Button variant="ghost" size="icon" onClick={onCopyURL}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
