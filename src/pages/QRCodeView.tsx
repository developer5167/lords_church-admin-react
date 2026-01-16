import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { eventAPI } from '@/services/api';
import { Event, Service } from '@/types';
import { formatTime, formatDisplayDate } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { Download, Copy, Share2, Printer, Church } from 'lucide-react';

const QRCodeView: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await eventAPI.getAll();
        for (const event of response.data) {
          const foundService = event.services.find((s: Service) => s.id === serviceId);
          if (foundService) {
            setService(foundService);
            setEventName(event.name);
            setEventDate(event.event_date);
            break;
          }
        }
      } catch (error) {
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceDetails();
  }, [serviceId]);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.fillStyle = 'white';
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0, 400, 400);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${service?.service_code || 'qr-code'}.png`;
      downloadLink.href = pngUrl;
      downloadLink.click();

      URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    };

    img.src = url;
  };

  const handleCopyURL = () => {
    if (service?.qr_url) {
      navigator.clipboard.writeText(service.qr_url);
      toast.success('QR URL copied to clipboard!');
    }
  };

  const handleShare = async () => {
    if (!service?.qr_url) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${eventName} - ${service.service_code}`,
          text: `Check in for ${eventName}`,
          url: service.qr_url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyURL();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="bg-card rounded-xl shadow-card p-8 animate-pulse">
            <div className="h-80 w-80 bg-muted rounded-lg mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (!service) {
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

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {/* Service Info Card */}
        <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20 animate-fade-in">
          <h2 className="font-semibold text-lg">{eventName}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{service.service_code}</span>
            <span>•</span>
            <span>{formatTime(service.service_time)}</span>
            <span>•</span>
            <span>{formatDisplayDate(eventDate)}</span>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-card rounded-xl shadow-card p-8 animate-scale-in print:shadow-none">
          <div
            ref={qrRef}
            className="flex items-center justify-center bg-background rounded-lg p-6 mb-6"
          >
            <QRCodeSVG
              value={service.qr_url}
              size={280}
              level="H"
              includeMargin
              imageSettings={{
                src: '',
                height: 0,
                width: 0,
                excavate: false,
              }}
            />
          </div>

          <div className="text-center mb-6 print:hidden">
            <p className="text-sm text-muted-foreground break-all">
              {service.qr_url}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 print:hidden">
            <Button onClick={handleDownload} variant="outline" className="h-12">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="h-12">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleCopyURL} variant="outline" className="h-12">
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
            <Button onClick={handlePrint} variant="outline" className="h-12">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <Church className="h-6 w-6" />
            <span>Scan to Check In</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {eventName} - {service.service_code}
          </p>
        </div>
      </main>
    </div>
  );
};

export default QRCodeView;
