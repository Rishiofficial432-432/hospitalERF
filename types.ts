// FIX: Create content for missing file to resolve module not found errors.
export interface Patient {
    id: string;
    name: string;
    dob: string; // date of birth
    gender: 'Male' | 'Female' | 'Other';
    contact: string;
    address: string;
    status: 'Active' | 'Inactive';
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    qrCodeData: string;

    // New fields for identification and insurance
    idProofType?: 'Aadhaar' | 'PAN Card' | 'Passport' | 'Voter ID' | 'Driving License';
    idProofNumber?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
}

export interface User {
    id: string;
    name: string;
    role: 'doctor' | 'receptionist';
}

export type MedicalRecordType = 'Consultation' | 'Lab Report' | 'Prescription' | 'Note';

export interface MedicalRecord {
    id:string;
    patientId: string;
    date: string; // ISO date string
    type: MedicalRecordType;
    title: string;
    details: string;
    doctorName: string;
}

export interface Appointment {
    id: string;
    patientId: string;
    date: string; // ISO date string
    title: string;
    doctorName: string;
}

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error';
}

export interface AppContextType {
    user: User | null;
    login: (role: 'doctor' | 'receptionist') => void;
    logout: () => void;
    
    // Global Data State
    patients: Patient[];
    records: MedicalRecord[];
    appointments: Appointment[];
    loading: boolean;
    
    // Data Manipulation Functions
    refreshData: () => Promise<void>;
    
    // Toast Notifications
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}