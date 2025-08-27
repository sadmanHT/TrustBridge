'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'default' | 'icon' | 'sm' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  showText?: boolean;
  successMessage?: string;
}

export function CopyButton({ 
  text, 
  className, 
  size = 'sm', 
  variant = 'ghost',
  showText = false,
  successMessage = 'Copied!'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const iconSize = {
    default: 'h-4 w-4',
    icon: 'h-4 w-4',
    sm: 'h-3 w-3',
    lg: 'h-5 w-5'
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'relative transition-all duration-200',
        copied && 'text-green-600',
        className
      )}
      onClick={handleCopy}
      title={copied ? successMessage : 'Copy to clipboard'}
    >
      <div className="flex items-center space-x-1">
        {copied ? (
          <Check className={iconSize[size]} />
        ) : (
          <Copy className={iconSize[size]} />
        )}
        {showText && (
          <span className="text-xs">
            {copied ? successMessage : 'Copy'}
          </span>
        )}
      </div>
    </Button>
  );
}

interface CopyFieldProps {
  label: string;
  value: string;
  className?: string;
  truncate?: boolean;
  maxLength?: number;
}

export function CopyField({ 
  label, 
  value, 
  className, 
  truncate = true, 
  maxLength = 20 
}: CopyFieldProps) {
  const displayValue = truncate && value.length > maxLength 
    ? `${value.slice(0, maxLength)}...` 
    : value;

  return (
    <div className={cn('flex items-center justify-between space-x-2', className)}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          {label}
        </p>
        <p className="text-sm font-mono bg-muted p-2 rounded border truncate" title={value}>
          {displayValue}
        </p>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

interface CopyTextProps {
  text: string;
  displayText?: string;
  className?: string;
  showCopyButton?: boolean;
}

export function CopyText({ 
  text, 
  displayText, 
  className, 
  showCopyButton = true 
}: CopyTextProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <span className="font-mono text-sm flex-1 truncate" title={text}>
        {displayText || text}
      </span>
      {showCopyButton && <CopyButton text={text} />}
    </div>
  );
}