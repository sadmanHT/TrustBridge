'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'mx-auto px-4 sm:px-6 lg:px-8',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Grid({ children, className, cols = { default: 1 }, gap = 'md' }: GridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const getColClasses = () => {
    const classes = ['grid'];
    
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  return (
    <div className={cn(
      getColClasses(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Flex({ 
  children, 
  className, 
  direction = 'row', 
  align = 'start', 
  justify = 'start', 
  wrap = false,
  gap = 'md'
}: FlexProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div className={cn(
      'flex',
      directionClasses[direction],
      alignClasses[align],
      justifyClasses[justify],
      wrap && 'flex-wrap',
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface StackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Stack({ children, className, spacing = 'md' }: StackProps) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8'
  };

  return (
    <div className={cn(
      'flex flex-col',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({ children, className, title, description, padding = 'lg' }: SectionProps) {
  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24'
  };

  return (
    <section className={cn(paddingClasses[padding], className)}>
      <Container>
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

interface ResponsiveProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  hideBelow?: boolean;
  hideAbove?: boolean;
}

export function Responsive({ 
  children, 
  className, 
  breakpoint = 'md', 
  hideBelow = false, 
  hideAbove = false 
}: ResponsiveProps) {
  const getVisibilityClasses = () => {
    if (hideBelow) {
      return `hidden ${breakpoint}:block`;
    }
    if (hideAbove) {
      return `block ${breakpoint}:hidden`;
    }
    return '';
  };

  return (
    <div className={cn(getVisibilityClasses(), className)}>
      {children}
    </div>
  );
}

interface CenterProps {
  children: React.ReactNode;
  className?: string;
  axis?: 'both' | 'horizontal' | 'vertical';
}

export function Center({ children, className, axis = 'both' }: CenterProps) {
  const axisClasses = {
    both: 'flex items-center justify-center',
    horizontal: 'flex justify-center',
    vertical: 'flex items-center'
  };

  return (
    <div className={cn(axisClasses[axis], className)}>
      {children}
    </div>
  );
}

interface SpacerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spacer({ size = 'md', className }: SpacerProps) {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
  };

  return <div className={cn(sizeClasses[size], className)} />;
}

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export function Divider({ className, orientation = 'horizontal', label }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('w-px bg-gray-200', className)} />
    );
  }

  if (label) {
    return (
      <div className={cn('relative', className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <hr className={cn('border-gray-200', className)} />
  );
}