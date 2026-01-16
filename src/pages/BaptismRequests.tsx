import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { baptismAPI } from '@/services/api';
import { BaptismRequest } from '@/types';
import { toast } from 'sonner';
import { Droplets, Check, RefreshCw, Filter, Calendar, User, Phone, Mail, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'pending' | 'completed';

const BaptismRequests: React.FC = () => {
  const [requests, setRequests] = useState<BaptismRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [completing, setCompleting] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await baptismAPI.getAll(status);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch baptism requests:', error);
      toast.error('Failed to load baptism requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleComplete = async (requestId: string) => {
    setCompleting(requestId);
    try {
      await baptismAPI.complete(requestId);
      toast.success('Baptism marked as completed');
      fetchRequests();
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error('Baptism request already completed');
      } else if (error.response?.status === 404) {
        toast.error('Baptism request not found');
      } else {
        toast.error('Failed to complete baptism request');
      }
    } finally {
      setCompleting(null);
    }
  };

  const pendingRequests = requests.filter(r => !r.completed_at);
  const completedRequests = requests.filter(r => r.completed_at);

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to export PDF');
      return;
    }

    const filterLabel = filter === 'all' ? 'All' : filter === 'pending' ? 'Pending' : 'Completed';
    const currentDate = format(new Date(), 'MMMM d, yyyy h:mm a');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Baptism Requests - ${filterLabel}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 28px;
              color: #1a1a1a;
            }
            .header p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .meta-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f0f0f0;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              border: 1px solid #ddd;
              font-size: 13px;
            }
            td {
              padding: 10px 12px;
              border: 1px solid #ddd;
              font-size: 12px;
            }
            tr:nth-child(even) {
              background-color: #fafafa;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
            }
            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }
            .status-completed {
              background-color: #d1fae5;
              color: #065f46;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 11px;
              color: #999;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌊 Baptism Requests</h1>
            <p>Lords Church Admin - ${filterLabel} Requests</p>
          </div>
          
          <div class="meta-info">
            <div>
              <strong>Total Records:</strong> ${requests.length}
            </div>
            <div>
              <strong>Generated:</strong> ${currentDate}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 20%">Member Name</th>
                <th style="width: 15%">Phone</th>
                <th style="width: 20%">Email</th>
                <th style="width: 15%">Requested Date</th>
                <th style="width: 15%">Completed Date</th>
                <th style="width: 10%">Status</th>
              </tr>
            </thead>
            <tbody>
              ${requests.map((request, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${request.member_name}</strong></td>
                  <td>${request.member_phone}</td>
                  <td>${request.member_email}</td>
                  <td>${format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}</td>
                  <td>${request.completed_at ? format(new Date(request.completed_at), 'MMM d, yyyy h:mm a') : '-'}</td>
                  <td>
                    <span class="status-badge ${request.completed_at ? 'status-completed' : 'status-pending'}">
                      ${request.completed_at ? '✓ Completed' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Lords Church Admin System | Generated on ${currentDate}</p>
            <p>This is an official record of baptism requests</p>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #f97316; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
              Print / Save as PDF
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px;">
              Close
            </button>
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
              <Droplets className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Baptism Requests</h1>
              <p className="text-sm text-muted-foreground">
                Manage baptism requests from members
              </p>
            </div>
          </div>

          <div className="flex gap-2">
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

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <Filter className="h-4 w-4 mr-2" />
            All ({requests.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({filter === 'all' ? pendingRequests.length : requests.length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed ({filter === 'all' ? completedRequests.length : requests.length})
          </Button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-card animate-pulse">
                <div className="h-6 w-48 bg-muted rounded mb-3" />
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-4 w-40 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center shadow-card">
            <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No baptism requests</h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? 'No pending baptism requests at the moment.' 
                : filter === 'completed'
                ? 'No completed baptism requests yet.'
                : 'No baptism requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className={cn(
                  'bg-card rounded-xl shadow-card overflow-hidden transition-all',
                  request.completed_at && 'opacity-75'
                )}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{request.member_name}</h3>
                        {request.completed_at ? (
                          <Badge variant="secondary" className="mt-1">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="mt-1 bg-amber-500 hover:bg-amber-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {!request.completed_at && (
                      <Button
                        size="sm"
                        onClick={() => handleComplete(request.id)}
                        disabled={completing === request.id}
                        className="warm-gradient"
                      >
                        {completing === request.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Mark Complete
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{request.member_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{request.member_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Requested: {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {request.completed_at && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <Check className="h-4 w-4" />
                        <span>
                          Completed: {format(new Date(request.completed_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BaptismRequests;
