import React, { useState, useEffect } from 'react';
import { CloseIcon } from './Icons';

// Card
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; }> = ({ children, className, onClick }) => {
    const baseClasses = "bg-white border border-slate-200 rounded-xl shadow-sm p-4";
    const clickableClasses = onClick ? "cursor-pointer hover:border-cyan-400 transition-colors" : "";
    return (
        <div className={`${baseClasses} ${clickableClasses} ${className || ''}`} onClick={onClick}>
            {children}
        </div>
    );
};

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', isLoading = false, ...props }) => {
    const baseClasses = "px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center";
    const variantClasses = {
        primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-500 focus:ring-offset-slate-100 shadow hover:shadow-lg',
        secondary: 'bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-100',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-slate-100 shadow hover:shadow-lg'
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`} disabled={isLoading} {...props}>
            {isLoading ? <Spinner variant={variant}/> : children}
        </button>
    );
};

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
    return (
        <input
            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${className || ''}`}
            ref={ref}
            {...props}
        />
    );
});

// Select
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => {
    return (
        <select
            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${className || ''}`}
            ref={ref}
            {...props}
        >
            {children}
        </select>
    );
});

// Textarea
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={`w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 ${className || ''}`}
            ref={ref}
            {...props}
        />
    );
});

// Spinner
export const Spinner: React.FC<{variant?: 'primary' | 'secondary' | 'danger'}> = ({variant = 'primary'}) => {
    const color = (variant === 'primary' || variant === 'danger') ? 'border-white' : 'border-slate-600'
    return (<div className={`animate-spin rounded-full h-5 w-5 border-b-2 ${color}`}></div>)
};

// Toast
export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error';
}

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    const baseClasses = "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    const typeClasses = {
        success: 'border-l-4 border-cyan-500',
        error: 'border-l-4 border-red-500'
    };

    return (
        <div className={`${baseClasses} ${typeClasses[toast.type]}`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-slate-800">{toast.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button onClick={() => onDismiss(toast.id)} className="inline-flex text-slate-400 hover:text-slate-600">
                           <CloseIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </div>
        </div>
    );
};

// Modal
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    titleClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, titleClassName }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-11/12 max-w-sm p-6 border border-slate-200 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-semibold ${titleClassName || 'text-cyan-600'}`}>{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="text-slate-600">{children}</div>
                {footer && <div className="mt-6 flex justify-end space-x-3">{footer}</div>}
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};