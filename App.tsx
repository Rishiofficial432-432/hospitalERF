// FIX: Create content for missing file to resolve module not found errors.
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientListPage from './pages/PatientListPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PatientFormPage from './pages/PatientFormPage';
import QrManagementPage from './pages/QrManagementPage';
import { User, AppContextType, Patient, MedicalRecord, Appointment, ToastMessage as ToastType } from './types';
import { ToastContainer } from './components/UI';
import { getPatients, getAllRecords, getAppointmentsForToday } from './services/api';

export const AppContext = React.createContext<AppContextType>({} as AppContextType);

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('hospital_erp_user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            return null;
        }
    });
    
    const [toasts, setToasts] = useState<ToastType[]>([]);
    
    // Global data state
    const [patients, setPatients] = useState<Patient[]>([]);
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);


    const addToast = useCallback((toast: Omit<ToastType, 'id'>) => {
        const newToast = { ...toast, id: Date.now() };
        setToasts(currentToasts => [...currentToasts, newToast]);
    }, []);

    const refreshData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [patientData, recordData, appointmentData] = await Promise.all([
                getPatients(),
                getAllRecords(),
                getAppointmentsForToday(),
            ]);
            setPatients(patientData);
            setRecords(recordData);
            setAppointments(appointmentData);
        } catch (error) {
            console.error("Failed to refresh data:", error);
            addToast({ message: "Failed to load application data.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        if (user) {
            refreshData();
        } else {
            // Clear data on logout
            setPatients([]);
            setRecords([]);
            setAppointments([]);
        }
    }, [user, refreshData]);

    const login = useCallback((role: 'doctor' | 'receptionist') => {
        const userData: User = {
            id: role === 'doctor' ? 'doc01' : 'rec01',
            name: role === 'doctor' ? 'Dr. Smith' : 'Receptionist',
            role: role
        };
        setUser(userData);
        localStorage.setItem('hospital_erp_user', JSON.stringify(userData));
        addToast({ message: `Welcome, ${userData.name}!`, type: 'success' });
    }, [addToast]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('hospital_erp_user');
        addToast({ message: 'You have been logged out.', type: 'success' });
    }, [addToast]);
    
    const onDismiss = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
    };

    const contextValue: AppContextType = {
        user,
        login,
        logout,
        patients,
        records,
        appointments,
        loading,
        refreshData,
        addToast,
    };

    return (
        <AppContext.Provider value={contextValue}>
            <HashRouter>
                {!user ? (
                    <Routes>
                        <Route path="/login" element={<LoginPage login={login} />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                ) : (
                     <Layout>
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/patients" element={<PatientListPage />} />
                            <Route path="/patients/new" element={<PatientFormPage />} />
                            <Route path="/patients/:id" element={<PatientDetailPage />} />
                            <Route path="/patients/:id/edit" element={<PatientFormPage />} />
                            <Route path="/qr-management" element={<QrManagementPage />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </Layout>
                )}
                <ToastContainer toasts={toasts} onDismiss={onDismiss} />
            </HashRouter>
        </AppContext.Provider>
    );
};

export default App;