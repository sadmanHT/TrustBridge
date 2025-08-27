import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Predefined skeleton components for common use cases
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border rounded-lg space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("h-10 w-24 rounded-md", className)} />
  );
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("h-10 w-10 rounded-full", className)} />
  );
}

export function SkeletonBadge({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("h-6 w-16 rounded-full", className)} />
  );
}

export function SkeletonTable({ rows = 3, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonQR({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <Skeleton className="h-48 w-48 rounded-lg" />
      <SkeletonText lines={2} className="w-48" />
    </div>
  );
}

export function SkeletonForm({ fields = 3, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" /> {/* Label */}
          <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
        </div>
      ))}
      <SkeletonButton className="w-full" />
    </div>
  );
}

export function SkeletonFileUpload({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProgress({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function SkeletonStats({ items = 4, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4", className)} style={{ gridTemplateColumns: `repeat(${Math.min(items, 4)}, 1fr)` }}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}