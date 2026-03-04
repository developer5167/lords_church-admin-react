import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { prayerRequestAPI } from '@/services/api';
import { toast } from 'sonner';
import { Heart, RefreshCw, Calendar, User, Phone, FileDown, Check, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface PrayerRequest {
  id: string;
  member_name: string;
  member_phone: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const PrayerRequests: React.FC = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [updatingParams, setUpdatingParams] = useState<{ id: string, status: string } | null>(null);
  const [customStatusInput, setCustomStatusInput] = useState<Record<string, string>>({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await prayerRequestAPI.getAll(dateFilter || undefined);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch prayer requests:', error);
      toast.error('Failed to load prayer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [dateFilter]);

  const handleUpdateStatus = async (requestId: string, status: string) => {
    if (!status.trim()) {
      toast.error('Status message cannot be empty');
      return;
    }

    setUpdatingParams({ id: requestId, status });
    try {
      await prayerRequestAPI.updateStatus(requestId, status);
      toast.success('Status updated successfully');
      setCustomStatusInput(prev => ({ ...prev, [requestId]: '' }));
      fetchRequests();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingParams(null);
    }
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to export PDF');
      return;
    }

    const currentDate = format(new Date(), 'MMMM d, yyyy h:mm a');
    const dateLabel = dateFilter ? `Date: ${dateFilter}` : 'All Dates';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prayer Requests - ${dateLabel}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0 0 10px 0; font-size: 28px; color: #1a1a1a; }
            .header p { margin: 5px 0; color: #666; font-size: 14px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f0f0f0; padding: 12px; text-align: left; font-weight: 600; border: 1px solid #ddd; font-size: 13px; }
            td { padding: 10px 12px; border: 1px solid #ddd; font-size: 12px; vertical-align: top; }
            tr:nth-child(even) { background-color: #fafafa; }
            .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
            .status-pending { background-color: #fef3c7; color: #92400e; }
            .status-responded { background-color: #d1fae5; color: #065f46; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #999; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🙏 Prayer Requests</h1>
            <p>Lords Church Admin — ${dateLabel}</p>
          </div>
          <div class="meta-info">
            <div><strong>Total Records:</strong> ${requests.length}</div>
            <div><strong>Generated:</strong> ${currentDate}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:4%">#</th>
                <th style="width:16%">Member</th>
                <th style="width:12%">Phone</th>
                <th style="width:20%">Subject</th>
                <th style="width:28%">Description</th>
                <th style="width:12%">Status</th>
                <th style="width:14%">Submitted</th>
              </tr>
            </thead>
            <tbody>
              ${requests.map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><strong>${r.member_name}</strong></td>
                  <td>${r.member_phone}</td>
                  <td>${r.subject}</td>
                  <td>${r.description}</td>
                  <td>
                    <span class="status-badge ${r.status.toLowerCase() === 'pending' ? 'status-pending' : 'status-responded'}">
                      ${r.status}
                    </span>
                  </td>
                  <td>${format(new Date(r.created_at), 'MMM d, yyyy h:mm a')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Lords Church Admin System | Generated on ${currentDate}</p>
            <p>This is an official record of prayer requests</p>
          </div>
          <div class="no-print" style="margin-top:30px;text-align:center;">
            <button onclick="window.print()" style="padding:10px 20px;background:#7c3aed;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">Print / Save as PDF</button>
            <button onclick="window.close()" style="padding:10px 20px;background:#6b7280;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;margin-left:10px;">Close</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Prayer Requests</h1>
              <p className="text-sm text-muted-foreground">
                Manage members' prayer requests
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-auto h-9"
            />
            {dateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateFilter('')}
                className="text-muted-foreground"
              >
                Clear Date
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={loading || requests.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRequests}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-card animate-pulse">
                <div className="h-6 w-48 bg-muted rounded mb-3" />
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-card">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No prayer requests</h3>
            <p className="text-muted-foreground">
              {dateFilter 
                ? 'No requests found for the selected date.' 
                : 'No prayer requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const pending = request.status.toLowerCase() === 'pending';
              const prayingWithYou = "We are with you and we also praying for your request.";

              return (
                <div
                  key={request.id}
                  className={cn(
                    'bg-card rounded-xl shadow-card flex flex-col',
                    !pending && 'border-l-4 border-l-green-500'
                  )}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 border-b pb-4">
                      
                      {/* Left: Info */}
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span className="bg-primary/10 text-primary p-2 rounded-lg inline-flex">
                              <MessageSquare className="w-5 h-5"/>
                            </span>
                            {request.subject}
                          </h3>
                        </div>

                        <p className="text-muted-foreground text-sm lg:text-base mb-2">
                          {request.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                            <User className="h-3 w-3" /> {request.member_name}
                          </div>
                          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                            <Phone className="h-3 w-3" /> {request.member_phone}
                          </div>
                          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                            <Calendar className="h-3 w-3" /> {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                          </div>
                        </div>
                      </div>

                      {/* Right: Status actions */}
                      <div className="flex flex-col items-end gap-3 min-w-[250px]">
                        <div className="text-right">
                          <span className="text-xs uppercase font-bold text-muted-foreground block mb-1">Status</span>
                          <Badge variant={pending ? 'outline' : 'secondary'} className={cn(
                            "px-3 py-1",
                            pending ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border-transparent" : "bg-green-100 text-green-800 hover:bg-green-100"
                          )}>
                            {request.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col w-full gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="w-full bg-primary/90 hover:bg-primary"
                            disabled={updatingParams?.id === request.id}
                            onClick={() => handleUpdateStatus(request.id, prayingWithYou)}
                          >
                            <Heart className={cn('h-4 w-4 mr-2', updatingParams?.id === request.id && 'animate-pulse')} />
                            Send "Praying With You"
                          </Button>
                          
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Or write custom status..."
                              value={customStatusInput[request.id] ?? ''}
                              onChange={(e) => setCustomStatusInput(prev => ({ ...prev, [request.id]: e.target.value }))}
                              className="h-8 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 px-3"
                              disabled={updatingParams?.id === request.id || !(customStatusInput[request.id]?.trim())}
                              onClick={() => handleUpdateStatus(request.id, customStatusInput[request.id]!)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Bottom notes / update time */}
                    {!pending && (
                      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                        <Check className="h-3 w-3" />
                        <span>Last updated: {format(new Date(request.updated_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default PrayerRequests;
