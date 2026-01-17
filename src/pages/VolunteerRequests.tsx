import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { volunteerAPI } from '@/services/api';
import { VolunteerRequest } from '@/types';
import { toast } from 'sonner';
import { 
  Users, 
  Check, 
  RefreshCw, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  FileDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MessageSquare,
  MapPin,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type FilterType = 'all' | 'pending' | 'completed';

const VolunteerRequests: React.FC = () => {
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [completing, setCompleting] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<VolunteerRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchRequests = async (page: number = 1) => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const response = await volunteerAPI.getAll({
        status,
        page,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setRequests(response.data.data.requests);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch volunteer requests:', error);
      toast.error('Failed to load volunteer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, [filter]);

  const handleCompleteClick = (request: VolunteerRequest) => {
    setSelectedRequest(request);
    setNotes('');
    setDialogOpen(true);
  };

  const handleCompleteSubmit = async () => {
    if (!selectedRequest) return;

    setCompleting(selectedRequest.id);
    try {
      await volunteerAPI.updateStatus(selectedRequest.id, {
        status: 'completed',
        notes: notes.trim() || undefined,
      });
      toast.success('Volunteer request marked as completed');
      setDialogOpen(false);
      setSelectedRequest(null);
      setNotes('');
      fetchRequests(pagination.currentPage);
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Request is already completed');
      } else if (error.response?.status === 404) {
        toast.error('Volunteer request not found');
      } else {
        toast.error('Failed to complete volunteer request');
      }
    } finally {
      setCompleting(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchRequests(newPage);
    }
  };

  const pendingCount = filter === 'all' ? requests.filter(r => r.status === 'pending').length : (filter === 'pending' ? requests.length : 0);
  const completedCount = filter === 'all' ? requests.filter(r => r.status === 'completed').length : (filter === 'completed' ? requests.length : 0);

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
          <title>Volunteer Requests - ${filterLabel}</title>
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
            .departments {
              font-size: 11px;
              color: #666;
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
            <h1>👥 Volunteer Requests</h1>
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
                <th style="width: 18%">Member Name</th>
                <th style="width: 12%">Phone</th>
                <th style="width: 18%">Email</th>
                <th style="width: 20%">Departments</th>
                <th style="width: 12%">Requested Date</th>
                <th style="width: 10%">Status</th>
              </tr>
            </thead>
            <tbody>
              ${requests.map((request, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${request.member.name}</strong></td>
                  <td>${request.member.phone}</td>
                  <td>${request.member.email}</td>
                  <td class="departments">
                    ${request.departments.map(d => `${d.departmentHeading} - ${d.departmentName}`).join('<br/>')}
                  </td>
                  <td>${format(new Date(request.createdAt), 'MMM d, yyyy')}</td>
                  <td>
                    <span class="status-badge ${request.status === 'completed' ? 'status-completed' : 'status-pending'}">
                      ${request.status === 'completed' ? '✓ Completed' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Lords Church Admin System | Generated on ${currentDate}</p>
            <p>This is an official record of volunteer requests</p>
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
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Volunteer Requests</h1>
              <p className="text-sm text-muted-foreground">
                Manage volunteer applications from members
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
              onClick={() => fetchRequests(pagination.currentPage)}
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
            All ({pagination.totalItems})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending {filter === 'pending' ? `(${pagination.totalItems})` : ''}
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed {filter === 'completed' ? `(${pagination.totalItems})` : ''}
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
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No volunteer requests</h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? 'No pending volunteer requests at the moment.' 
                : filter === 'completed'
                ? 'No completed volunteer requests yet.'
                : 'No volunteer requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    'bg-card rounded-xl shadow-card overflow-hidden transition-all',
                    request.status === 'completed' && 'opacity-75'
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{request.member.name}</h3>
                          {request.status === 'completed' ? (
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
                      
                      {request.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteClick(request)}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{request.member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{request.member.email}</span>
                      </div>
                      {request.member.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{request.member.address}</span>
                        </div>
                      )}
                      {request.member.memberSince && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Member since {format(new Date(request.member.memberSince), 'MMM yyyy')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Requested: {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {request.completedAt && (
                        <div className="flex items-center gap-2 text-sm text-success">
                          <Check className="h-4 w-4" />
                          <span>
                            Completed: {format(new Date(request.completedAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Departments */}
                    {request.departments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-start gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-2">Interested Departments:</p>
                            <div className="flex flex-wrap gap-2">
                              {request.departments.map((dept) => (
                                <Badge key={dept.id} variant="outline" className="text-xs">
                                  {dept.departmentHeading} - {dept.departmentName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {request.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium mb-1">Notes:</p>
                            <p className="text-sm text-muted-foreground">{request.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Complete Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Volunteer Request</DialogTitle>
            <DialogDescription>
              Mark this volunteer request as completed. You can optionally add notes about the action taken.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">{selectedRequest.member.name}</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.member.email}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedRequest.departments.map((dept) => (
                    <Badge key={dept.id} variant="outline" className="text-xs">
                      {dept.departmentName}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g., Called member on 2026-01-17. Member assigned to Worship team."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {notes.length}/1000 characters
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setSelectedRequest(null);
                setNotes('');
              }}
              disabled={completing !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteSubmit}
              disabled={completing !== null}
              className="warm-gradient"
            >
              {completing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerRequests;
