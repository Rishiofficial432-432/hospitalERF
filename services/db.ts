import { Patient, MedicalRecord, Appointment } from '../types';

// Omit some fields for creation
type PatientCreationData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'qrCodeData'>;
type MedicalRecordCreationData = Omit<MedicalRecord, 'id' | 'date'>;


class MockDB {
    private patients: Patient[] = [];
    private medicalRecords: MedicalRecord[] = [];
    private appointments: Appointment[] = [];
    private readonly DB_KEY = 'hospital_erp_patients';
    private readonly RECORDS_DB_KEY = 'hospital_erp_records';
    private readonly APPOINTMENTS_DB_KEY = 'hospital_erp_appointments';

    constructor() {
        this.load();
    }

    private load() {
        try {
            const data = localStorage.getItem(this.DB_KEY);
            if (data) {
                this.patients = JSON.parse(data);
            } else {
                // Initialize with some mock data
                this.patients = [
                    {
                        id: 'p001',
                        name: 'John Doe',
                        dob: '1985-05-20',
                        gender: 'Male',
                        contact: '123-456-7890',
                        address: '123 Main St, Anytown, USA',
                        status: 'Active',
                        createdAt: new Date('2023-01-15T09:00:00Z').toISOString(),
                        updatedAt: new Date('2023-01-15T09:00:00Z').toISOString(),
                        qrCodeData: 'patient_id=p001&name=JohnDoe',
                        idProofType: 'Aadhaar',
                        idProofNumber: '1234 5678 9012',
                        insuranceProvider: 'MediCare Plus',
                        insurancePolicyNumber: 'MCP987654321',
                    },
                     {
                        id: 'p002',
                        name: 'Jane Smith',
                        dob: '1992-08-12',
                        gender: 'Female',
                        contact: '987-654-3210',
                        address: '456 Oak Ave, Anytown, USA',
                        status: 'Active',
                        createdAt: new Date('2023-02-20T14:30:00Z').toISOString(),
                        updatedAt: new Date('2023-02-20T14:30:00Z').toISOString(),
                        qrCodeData: 'patient_id=p002&name=JaneSmith',
                        idProofType: 'Passport',
                        idProofNumber: 'A1B23C45D',
                        insuranceProvider: 'Global Health',
                        insurancePolicyNumber: 'GH123456789',
                    },
                    {
                        id: 'p003',
                        name: 'Peter Jones',
                        dob: '1978-11-03',
                        gender: 'Male',
                        contact: '555-123-4567',
                        address: '789 Pine Ln, Anytown, USA',
                        status: 'Inactive',
                        createdAt: new Date('2023-03-10T11:00:00Z').toISOString(),
                        updatedAt: new Date('2023-03-10T11:00:00Z').toISOString(),
                        qrCodeData: 'patient_id=p003&name=PeterJones',
                        idProofType: 'Driving License',
                        idProofNumber: 'DL-XYZ-9876',
                        insuranceProvider: 'SafeGuard Insurance',
                        insurancePolicyNumber: 'SGI-555-1234',
                    }
                ];
                this.save();
            }

            const recordData = localStorage.getItem(this.RECORDS_DB_KEY);
            if (recordData) {
                this.medicalRecords = JSON.parse(recordData);
            } else {
                this.medicalRecords = [
                    {
                        id: 'rec001',
                        patientId: 'p001',
                        date: new Date('2023-10-26T10:00:00Z').toISOString(),
                        type: 'Consultation',
                        title: 'Annual Check-up',
                        details: 'Patient is in good health. Advised to continue regular exercise and balanced diet.',
                        doctorName: 'Dr. Smith'
                    },
                    {
                        id: 'rec002',
                        patientId: 'p001',
                        date: new Date('2023-11-15T14:00:00Z').toISOString(),
                        type: 'Lab Report',
                        title: 'Blood Test Results',
                        details: 'Cholesterol levels are slightly elevated. All other markers are within normal range.',
                        doctorName: 'Dr. Smith'
                    },
                    {
                        id: 'rec003',
                        patientId: 'p002',
                        date: new Date('2023-12-01T09:30:00Z').toISOString(),
                        type: 'Prescription',
                        title: 'Allergy Medication',
                        details: 'Prescribed Loratadine 10mg, once daily for seasonal allergies.',
                        doctorName: 'Dr. Smith'
                    }
                ];
                this.saveRecords();
            }
            
            this.loadAppointments();

        } catch (error) {
            console.error("Could not load from localStorage", error);
            this.patients = [];
            this.medicalRecords = [];
            this.appointments = [];
        }
    }
    
    private loadAppointments() {
        try {
            const data = localStorage.getItem(this.APPOINTMENTS_DB_KEY);
            if (data) {
                this.appointments = JSON.parse(data);
            } else {
                const today = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(today.getDate() + 1);

                this.appointments = [
                    { id: 'app001', patientId: 'p001', date: today.toISOString(), title: 'Follow-up Consultation', doctorName: 'Dr. Smith' },
                    { id: 'app002', patientId: 'p002', date: today.toISOString(), title: 'Annual Physical Exam', doctorName: 'Dr. Smith' },
                    { id: 'app003', patientId: 'p001', date: tomorrow.toISOString(), title: 'Dental Check-up', doctorName: 'Dr. Jones' },
                ];
                this.saveAppointments();
            }
        } catch (error) {
            console.error("Could not load appointments from localStorage", error);
            this.appointments = [];
        }
    }

    private save() {
        try {
            localStorage.setItem(this.DB_KEY, JSON.stringify(this.patients));
        } catch (error) {
            console.error("Could not save to localStorage", error);
        }
    }

    private saveRecords() {
        try {
            localStorage.setItem(this.RECORDS_DB_KEY, JSON.stringify(this.medicalRecords));
        } catch (error) {
            console.error("Could not save records to localStorage", error);
        }
    }
    
    private saveAppointments() {
        try {
            localStorage.setItem(this.APPOINTMENTS_DB_KEY, JSON.stringify(this.appointments));
        } catch (error) {
            console.error("Could not save appointments to localStorage", error);
        }
    }

    private generateId(): string {
        const lastId = this.patients.reduce((max, p) => {
            const num = parseInt(p.id.replace('p', ''), 10);
            return num > max ? num : max;
        }, 0);
        return `p${(lastId + 1).toString().padStart(3, '0')}`;
    }

    private generateRecordId(): string {
        const lastId = this.medicalRecords.reduce((max, r) => {
            const num = parseInt(r.id.replace('rec', ''), 10);
            return num > max ? num : max;
        }, 0);
        return `rec${(lastId + 1).toString().padStart(3, '0')}`;
    }
    
    getPatients(): Patient[] {
        return [...this.patients];
    }

    getPatient(id: string): Patient | undefined {
        return this.patients.find(p => p.id === id);
    }

    addPatient(data: PatientCreationData): Patient {
        const now = new Date().toISOString();
        const newId = this.generateId();
        const newPatient: Patient = {
            ...data,
            id: newId,
            createdAt: now,
            updatedAt: now,
            qrCodeData: `patient_id=${newId}&name=${data.name.replace(/\s/g, '')}`,
        };
        this.patients.push(newPatient);
        this.save();
        return newPatient;
    }

    updatePatient(id: string, data: Partial<PatientCreationData>): Patient | null {
        const index = this.patients.findIndex(p => p.id === id);
        if (index === -1) {
            return null;
        }
        const updatedPatient = {
            ...this.patients[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        this.patients[index] = updatedPatient;
        this.save();
        return updatedPatient;
    }

    deletePatient(id: string): boolean {
        const initialLength = this.patients.length;
        this.patients = this.patients.filter(p => p.id !== id);
        if (this.patients.length < initialLength) {
            this.medicalRecords = this.medicalRecords.filter(r => r.patientId !== id);
            this.appointments = this.appointments.filter(a => a.patientId !== id);
            this.save();
            this.saveRecords();
            this.saveAppointments();
            return true;
        }
        return false;
    }

    // Medical Record methods
    getAllRecords(): MedicalRecord[] {
        return [...this.medicalRecords];
    }

    getRecordsForPatient(patientId: string): MedicalRecord[] {
        return this.medicalRecords
            .filter(r => r.patientId === patientId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    addMedicalRecord(data: MedicalRecordCreationData): MedicalRecord {
        const newRecord: MedicalRecord = {
            ...data,
            id: this.generateRecordId(),
            date: new Date().toISOString(),
        };
        this.medicalRecords.push(newRecord);
        this.saveRecords();
        return newRecord;
    }

    deleteMedicalRecord(id: string): boolean {
        const initialLength = this.medicalRecords.length;
        this.medicalRecords = this.medicalRecords.filter(r => r.id !== id);
        if (this.medicalRecords.length < initialLength) {
            this.saveRecords();
            return true;
        }
        return false;
    }
    
    // Appointment methods
    public getAppointmentsForToday(): Appointment[] {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        return this.appointments.filter(app => {
            const appDate = new Date(app.date);
            return appDate >= new Date(startOfDay) && appDate < new Date(endOfDay);
        });
    }
}

export const db = new MockDB();
