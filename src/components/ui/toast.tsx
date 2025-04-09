'use client';
import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const toast = {
  success: ({ title, description, duration = 3000, action }: ToastProps) => {
    sonnerToast.success(title, {
      description,
      duration: action ? Infinity : duration,
      action: action
        ? {
            label: action.label,
            onClick: () => {
              action.onClick();
              sonnerToast.dismiss();
            },
          }
        : undefined,
    });
  },

  error: ({ title, description, duration = 3000 }: Omit<ToastProps, 'action'>) => {
    sonnerToast.error(title, {
      description,
      duration,
    });
  },

  info: ({ title, description, duration = 3000 }: Omit<ToastProps, 'action'>) => {
    sonnerToast(title, {
      description,
      duration,
    });
  },
};