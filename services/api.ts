import { db } from './db';
import { Patient, MedicalRecord, Appointment } from '../types';

type PatientCreationData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'qrCodeData'>;
type MedicalRecordCreationData = Omit<MedicalRecord, 'id' | 'date'>;

const SIMULATED_DELAY = 500;

export const getPatients = (): Promise<Patient[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.getPatients());
        }, SIMULATED_DELAY);
    });
};

export const getPatient = (id: string): Promise<Patient | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.getPatient(id));
        }, SIMULATED_DELAY);
    });
};

export const addPatient = (data: PatientCreationData): Promise<Patient> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newPatient = db.addPatient(data);
            resolve(newPatient);
        }, SIMULATED_DELAY);
    });
};

export const updatePatient = (id: string, data: Partial<PatientCreationData>): Promise<Patient | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const updatedPatient = db.updatePatient(id, data);
            resolve(updatedPatient);
        }, SIMULATED_DELAY);
    });
};

export const deletePatient = (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const success = db.deletePatient(id);
            resolve(success);
        }, SIMULATED_DELAY);
    });
};

// Medical Record API functions
export const getAllRecords = (): Promise<MedicalRecord[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.getAllRecords());
        }, SIMULATED_DELAY);
    });
};

export const getRecordsForPatient = (patientId: string): Promise<MedicalRecord[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.getRecordsForPatient(patientId));
        }, SIMULATED_DELAY);
    });
};

export const addMedicalRecord = (data: MedicalRecordCreationData): Promise<MedicalRecord> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newRecord = db.addMedicalRecord(data);
            resolve(newRecord);
        }, SIMULATED_DELAY);
    });
};

export const deleteMedicalRecord = (id: string): Promise<boolean> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const success = db.deleteMedicalRecord(id);
            resolve(success);
        }, SIMULATED_DELAY);
    });
};

// Appointment API functions
export const getAppointmentsForToday = (): Promise<Appointment[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.getAppointmentsForToday());
        }, SIMULATED_DELAY);
    });
};
