// FIX: Create content for missing file to resolve module not found errors.
import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { HospitalIcon, DoctorIcon, PatientIcon } from '../components/Icons';

interface LoginPageProps {
    login: (role: 'doctor' | 'receptionist') => void;
}

interface RoleSelectorProps {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    selected: boolean;
    onSelect: () => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ id, label, description, icon, selected, onSelect }) => (
    <div 
        onClick={onSelect}
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selected ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200' : 'border-slate-300 hover:border-slate-400'}`}
    >
        <input 
            type="radio" 
            name="role" 
            id={id} 
            checked={selected}
            onChange={onSelect}
            className="hidden"
        />
        <div className="mr-4">{icon}</div>
        <div>
            <label htmlFor={id} className="font-semibold text-slate-800 cursor-pointer">{label}</label>
            <p className="text-sm text-slate-500">{description}</p>
        </div>
    </div>
);


const LoginPage: React.FC<LoginPageProps> = ({ login }) => {
    const [role, setRole] = useState<'doctor' | 'receptionist'>('doctor');
    
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login(role);
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-6">
                     <div className="flex items-center text-3xl font-bold text-cyan-600">
                        <HospitalIcon className="h-10 w-10 mr-2"/>
                        <span>MediQR</span>
                    </div>
                </div>
                <Card className="p-8">
                    <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Welcome Back!</h1>
                    <p className="text-slate-500 text-center mb-8">Select your role to sign in.</p>
                    <form onSubmit={handleLogin}>
                         <div className="space-y-4">
                            <RoleSelector 
                                id="doctor"
                                label="Doctor"
                                description="Full access to patient records"
                                icon={<DoctorIcon className="h-6 w-6 text-slate-500" />}
                                selected={role === 'doctor'}
                                onSelect={() => setRole('doctor')}
                            />
                            <RoleSelector 
                                id="receptionist"
                                label="Receptionist"
                                description="Read-only access and QR management"
                                icon={<PatientIcon className="h-6 w-6 text-slate-500" />}
                                selected={role === 'receptionist'}
                                onSelect={() => setRole('receptionist')}
                            />
                        </div>
                        <Button type="submit" className="w-full mt-8">
                            Sign In as {role === 'doctor' ? 'Doctor' : 'Receptionist'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;
