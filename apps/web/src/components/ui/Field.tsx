'use client';

import { forwardRef, ReactNode } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FieldProps {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ 
  label, 
  description, 
  error, 
  success, 
  required, 
  className, 
  children 
}: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <div className="relative">
        {children}
        
        {/* Success/Error Icons */}
        {(error || success) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-600 flex items-center space-x-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </p>
      )}
      
      {success && !error && (
        <p className="text-xs text-green-600 flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>{success}</span>
        </p>
      )}
    </div>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  fieldClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, description, error, success, required, fieldClassName, className, ...props }, ref) => {
    return (
      <Field 
        label={label} 
        description={description} 
        error={error} 
        success={success} 
        required={required}
        className={fieldClassName}
      >
        <Input
          ref={ref}
          className={cn(
            error && 'border-red-500 focus:border-red-500',
            success && !error && 'border-green-500 focus:border-green-500',
            className
          )}
          {...props}
        />
      </Field>
    );
  }
);

InputField.displayName = 'InputField';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  fieldClassName?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, description, error, success, required, fieldClassName, className, ...props }, ref) => {
    return (
      <Field 
        label={label} 
        description={description} 
        error={error} 
        success={success} 
        required={required}
        className={fieldClassName}
      >
        <Textarea
          ref={ref}
          className={cn(
            error && 'border-red-500 focus:border-red-500',
            success && !error && 'border-green-500 focus:border-green-500',
            className
          )}
          {...props}
        />
      </Field>
    );
  }
);

TextareaField.displayName = 'TextareaField';

interface HashFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  success?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function HashField({ 
  value, 
  onChange, 
  error, 
  success, 
  label = 'Document Hash',
  placeholder = '0x...',
  className 
}: HashFieldProps) {
  const isValidHash = /^0x[0-9a-fA-F]{64}$/.test(value);
  const displaySuccess = success || (value && isValidHash ? 'Valid hash format' : undefined);
  const displayError = error || (value && !isValidHash ? 'Invalid hash format (must be 0x + 64 hex characters)' : undefined);

  return (
    <InputField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      error={displayError}
      success={displaySuccess}
      className={cn('font-mono', className)}
      fieldClassName="space-y-2"
    />
  );
}