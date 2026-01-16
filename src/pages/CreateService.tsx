import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { serviceAPI, eventAPI } from '@/services/api';
import { Service, Event } from '@/types';
import { formatTime, formatDisplayDate } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { Loader2, Plus, QrCode, Users, Check } from 'lucide-react';

const CreateService: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCode, setServiceCode] = useState('');
  const [serviceTime, setServiceTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);

  useEffect(() => {
    
    fetchEvent();
  }, [eventId]);
const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const response = await eventAPI.getAll();
        const foundEvent = response.data.find((e: Event) => e.id === eventId);
        if (foundEvent) {
          setEvent(foundEvent);
          setServices(foundEvent.services || []);
        }
      } catch (error) {
        toast.error('Failed to load event details');
      } finally {
        setFetchingEvent(false);
      }
    };
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceCode.trim()) {
      toast.error('Please enter a service code');
      return;
    }

    if (services.some((s) => s.service_code === serviceCode.trim())) {
      toast.error('Service code already exists for this event');
      return;
    }

    setLoading(true);
    try {
      const response = await serviceAPI.create(eventId!, serviceCode.trim(), serviceTime);
      if(response.status==200){
         fetchEvent();
         toast.success('Service added successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    navigate('/dashboard');
  };

  const suggestNextCode = () => {
    const existingCodes = services.map((s) => s.service_code);
    for (let i = 1; i <= 10; i++) {
      const code = `SS${i}`;
      if (!existingCodes.includes(code)) {
        setServiceCode(code);
        return;
      }
    }
  };

  if (fetchingEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="bg-card rounded-xl shadow-card p-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-4" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Event Info */}
        {event && (
          <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
            <h2 className="font-semibold text-lg">{event.name}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDisplayDate(event.event_date)}
            </p>
          </div>
        )}

        {/* Add Service Form */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6 animate-fade-in">
          <h1 className="text-xl font-bold mb-6">Add Services</h1>

          <form onSubmit={handleAddService} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceCode">Service Code</Label>
              <div className="flex gap-2">
                <Input
                  id="serviceCode"
                  type="text"
                  placeholder="e.g., SS1, SS2"
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value.toUpperCase())}
                  className="h-12 input-focus-ring flex-1"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={suggestNextCode}
                  disabled={loading}
                >
                  Suggest
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceTime">Service Time</Label>
              <Input
                id="serviceTime"
                type="time"
                value={serviceTime}
                onChange={(e) => setServiceTime(e.target.value)}
                className="h-12 input-focus-ring"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full warm-gradient hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Added Services */}
        {services.length > 0 && (
          <div className="bg-card rounded-xl shadow-card p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold mb-4">Added Services ({services.length})</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-muted/30 rounded-lg p-4 flex items-center justify-between border border-border/50"
                >
                  <div>
                    <span className="font-medium">{service.service_code}</span>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span>{formatTime(service.service_time)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/qr/${service.id}`)}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      QR
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/attendance/${service.id}`)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done Button */}
        <Button
          onClick={handleDone}
          variant="outline"
          className="w-full h-12"
        >
          <Check className="h-4 w-4 mr-2" />
          Done - Go to Dashboard
        </Button>
      </main>
    </div>
  );
};

export default CreateService;
