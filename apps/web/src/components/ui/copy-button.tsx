'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  ariaLabel?: string;
}

export function CopyButton({
  text,
  className,
  variant = 'ghost',
  size = 'icon',
  showText = false,
  ariaLabel = 'Copy to clipboard'
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              variant={variant}
              size={size}
              onClick={handleCopy}
              className={cn(
                'transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900',
                copied && 'text-green-400',
                className
              )}
              aria-label={ariaLabel}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {showText && (
                <span className="ml-2">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              )}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : 'Copy to clipboard'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Utility component for displaying text with copy button
interface CopyableTextProps {
  text: string;
  displayText?: string;
  className?: string;
  truncate?: boolean;
  maxLength?: number;
}

export function CopyableText({
  text,
  displayText,
  className,
  truncate = false,
  maxLength = 20
}: CopyableTextProps) {
  const display = displayText || text;
  const truncatedText = truncate && display.length > maxLength
    ? `${display.slice(0, maxLength)}...`
    : display;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-mono text-sm text-slate-300 break-all">
        {truncatedText}
      </span>
      <CopyButton text={text} />
    </div>
  );
}