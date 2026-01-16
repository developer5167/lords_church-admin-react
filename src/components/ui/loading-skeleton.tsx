import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'stat';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className, variant = 'card' }) => {
  if (variant === 'stat') {
    return (
      <div className={cn("stat-card animate-pulse", className)}>
        <div className="h-4 w-20 bg-muted rounded mb-2" />
        <div className="h-8 w-16 bg-muted rounded" />
      </div>
    );
  }

  if (variant === 'text') {
    return <div className={cn("h-4 bg-muted rounded animate-pulse", className)} />;
  }

  return (
    <div className={cn("bg-card rounded-xl p-6 shadow-card animate-pulse", className)}>
      <div className="h-6 w-3/4 bg-muted rounded mb-4" />
      <div className="h-4 w-1/2 bg-muted rounded mb-3" />
      <div className="space-y-3">
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    </div>
  );
};

export const EventCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-xl p-6 shadow-card animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
      <div className="h-8 w-20 bg-muted rounded" />
    </div>
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="bg-muted/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-5 w-20 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const AttendeeCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg p-4 shadow-soft animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 bg-muted rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
      <div className="h-6 w-16 bg-muted rounded-full" />
    </div>
  </div>
);
