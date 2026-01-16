import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { paymentAPI } from '@/services/api';
import { toast } from 'sonner';
import { Loader2, Copy, ExternalLink, CreditCard, Check } from 'lucide-react';

const PaymentLink: React.FC = () => {
  const [paymentLink, setPaymentLink] = useState('');
  const [originalLink, setOriginalLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaymentLink = async () => {
      try {
        const response = await paymentAPI.getLink();
        const link = response.data.paymentLink || '';
        setPaymentLink(link);
        setOriginalLink(link);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          toast.error('Failed to load payment link');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentLink();
  }, []);

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentLink.trim()) {
      toast.error('Please enter a payment link');
      return;
    }

    if (!isValidUrl(paymentLink)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setSaving(true);
    try {
      await paymentAPI.setLink(paymentLink.trim());
      setOriginalLink(paymentLink.trim());
      toast.success('Payment link saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save payment link');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (paymentLink) {
      navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      toast.success('Payment link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (paymentLink && isValidUrl(paymentLink)) {
      window.open(paymentLink, '_blank');
    }
  };

  const hasChanges = paymentLink !== originalLink;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <div className="bg-card rounded-xl shadow-card p-6 animate-pulse">
            <div className="h-8 w-48 bg-muted rounded mb-4" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Payment Link</h1>
              <p className="text-sm text-muted-foreground">
                Configure your church's donation link
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="paymentLink">Donation / Payment URL</Label>
              <div className="relative">
                <Input
                  id="paymentLink"
                  type="url"
                  placeholder="https://donate.example.com/your-church"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className={`h-12 pr-20 input-focus-ring ${
                    paymentLink && !isValidUrl(paymentLink) ? 'border-destructive' : ''
                  }`}
                  disabled={saving}
                />
                {paymentLink && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-8 w-8"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleOpenLink}
                      disabled={!isValidUrl(paymentLink)}
                      className="h-8 w-8"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {paymentLink && !isValidUrl(paymentLink) && (
                <p className="text-xs text-destructive">Please enter a valid URL</p>
              )}
              <p className="text-xs text-muted-foreground">
                This link will be displayed to members for donations and offerings
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !hasChanges || !isValidUrl(paymentLink)}
                className="flex-1 warm-gradient hover:opacity-90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Link'
                )}
              </Button>
            </div>
          </form>

          {originalLink && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Current payment link:</p>
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between gap-2">
                <p className="text-sm truncate flex-1">{originalLink}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(originalLink, '_blank')}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PaymentLink;
