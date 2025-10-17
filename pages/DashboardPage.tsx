import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Header } from '../components/Layout';
import { Card, Button, Spinner, Input } from '../components/UI';
import { PatientIcon, PlusIcon, FileTextIcon, QRIcon, BeakerIcon, PillIcon, CheckCircleIcon, XCircleIcon, ViewIcon } from '../components/Icons';
import { Link, useNavigate } from 'react-router-dom';
import { getPatient } from '../services/api';
import { AppContext } from '../App';
import { MedicalRecordType } from '../types';

const StatCard = ({ icon, label, value, color, loading }: { icon: React.ReactNode; label: string; value: string, color: string, loading: boolean }) => (
    <Card>
        <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500">{label}</p>
                {loading ? <div className="h-8 w-12 bg-slate-200 rounded animate-pulse mt-1"></div> : <p className="text-2xl font-bold text-slate-800">{value}</p>}
            </div>
        </div>
    </Card>
);

const RecordTypeIcon: React.FC<{type: MedicalRecordType, className?: string}> = ({ type, className = "h-6 w-6" }) => {
    switch(type) {
        case 'Consultation': return <FileTextIcon className={`${className} text-blue-500`} />;
        case 'Lab Report': return <BeakerIcon className={`${className} text-purple-500`} />;
        case 'Prescription': return <PillIcon className={`${className} text-emerald-500`} />;
        case 'Note': return <FileTextIcon className={`${className} text-slate-500`} />;
        default: return <FileTextIcon className={`${className} text-slate-500`} />;
    }
};

const DashboardPage: React.FC = () => {
    const { user, patients, records, appointments, loading } = useContext(AppContext);
    const navigate = useNavigate();

    // States for patient lookup
    const [lookupId, setLookupId] = useState('');
    const [lookupResult, setLookupResult] = useState<{ status: 'found' | 'not_found' | 'error' | 'idle', patient?: import('../types').Patient, message?: string }>({ status: 'idle' });
    const [isCheckingId, setIsCheckingId] = useState(false);
    
    const stats = useMemo(() => ({
        totalPatients: patients.length,
        activePatients: patients.filter(p => p.status === 'Active').length,
        totalRecords: records.length,
        appointmentsToday: appointments.length
    }), [patients, records, appointments]);

    const recentActivity = useMemo(() => {
        const patientMap = new Map(patients.map(p => [p.id, p.name]));
        return records
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4)
            .map(record => ({
                ...record,
                patientName: patientMap.get(record.patientId) || 'Unknown Patient'
            }));
    }, [records, patients]);
    
    const handleIdLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lookupId.trim()) return;

        setIsCheckingId(true);
        setLookupResult({ status: 'idle' });
        try {
            // First check the globally available patients for instant result
            const patientInState = patients.find(p => p.id === lookupId.trim());
            if (patientInState) {
                 setLookupResult({ status: 'found', patient: patientInState });
                 return;
            }
            // If not found in state, do a direct API call as a fallback
            const foundPatient = await getPatient(lookupId.trim());
            if (foundPatient) {
                setLookupResult({ status: 'found', patient: foundPatient });
            } else {
                setLookupResult({ status: 'not_found', message: `Patient with ID "${lookupId}" not found.` });
            }
        } catch (error) {
            setLookupResult({ status: 'error', message: 'An error occurred during lookup.' });
            console.error("Patient lookup failed:", error);
        } finally {
            setIsCheckingId(false);
        }
    };
    
    // reset lookup on input change
    useEffect(() => {
        if(lookupResult.status !== 'idle') {
            setLookupResult({ status: 'idle' });
        }
    }, [lookupId]);


    return (
        <>
            <Header title={`Welcome, ${user?.name || ''}!`} />
            <div className="p-4 space-y-6">
                 <div>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            icon={<PatientIcon className="h-6 w-6 text-cyan-600"/>}
                            label="Total Patients"
                            value={String(stats.totalPatients)}
                            color="bg-cyan-100"
                            loading={loading}
                        />
                         <StatCard 
                            icon={<FileTextIcon className="h-6 w-6 text-indigo-600"/>}
                            label="Total Records"
                            value={String(stats.totalRecords)}
                            color="bg-indigo-100"
                            loading={loading}
                        />
                         <StatCard 
                            icon={<PatientIcon className="h-6 w-6 text-emerald-600"/>}
                            label="Active Patients"
                            value={String(stats.activePatients)}
                            color="bg-emerald-100"
                            loading={loading}
                        />
                        <StatCard 
                            icon={<QRIcon className="h-6 w-6 text-amber-600"/>}
                            label="Appointments Today"
                            value={String(stats.appointmentsToday)}
                            color="bg-amber-100"
                            loading={loading}
                        />
                    </div>
                </div>

                 <Card>
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Quick Patient Lookup</h3>
                    <form onSubmit={handleIdLookup} className="space-y-4">
                        <div>
                            <label htmlFor="patient-id-lookup" className="sr-only">Enter Patient ID</label>
                            <Input 
                                id="patient-id-lookup"
                                placeholder="Enter Patient ID (e.g., p001)"
                                value={lookupId}
                                onChange={(e) => setLookupId(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full" isLoading={isCheckingId}>
                            Verify ID
                        </Button>
                    </form>
                    {lookupResult.status !== 'idle' && !isCheckingId && (
                         <div className="mt-4 p-4 rounded-lg flex items-start space-x-3 border"
                            style={{
                                backgroundColor: lookupResult.status === 'found' ? '#f0fdfa' : '#fff1f2',
                                borderColor: lookupResult.status === 'found' ? '#a7f3d0' : '#fecdd3',
                            }}>
                            {lookupResult.status === 'found' ? 
                                <CheckCircleIcon className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0"/> :
                                <XCircleIcon className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0"/>}
                           
                            <div className="flex-1">
                                {lookupResult.status === 'found' && lookupResult.patient ? (
                                    <>
                                        <p className="font-semibold text-emerald-800">Patient Found</p>
                                        <p className="text-sm text-slate-700">Name: {lookupResult.patient.name}</p>
                                        <Button 
                                            variant="secondary" 
                                            className="mt-2 !py-1 !px-2 text-xs" 
                                            onClick={() => navigate(`/patients/${lookupResult.patient!.id}`)}>
                                            <ViewIcon className="h-4 w-4 mr-1"/> View Details
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-red-800">{lookupResult.status === 'not_found' ? 'Not Found' : 'Error'}</p>
                                        <p className="text-sm text-red-700">{lookupResult.message}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                <Card>
                    <h3 className="font-semibold text-lg text-slate-700 mb-2">Quick Actions</h3>
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <Link to="/patients/new">
                            <Button variant="secondary" className="w-full !py-4 flex-col h-full">
                                <PlusIcon className="h-6 w-6 mb-1 text-cyan-600" />
                                <span className="text-sm">Add Patient</span>
                            </Button>
                        </Link>
                         <Link to="/qr-management">
                            <Button variant="secondary" className="w-full !py-4 flex-col h-full">
                                <QRIcon className="h-6 w-6 mb-1 text-cyan-600" />
                                <span className="text-sm">Scan QR Code</span>
                            </Button>
                        </Link>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-semibold text-lg text-slate-700 mb-4">Recent Activity</h3>
                    {loading ? (
                         <div className="flex justify-center items-center h-40"><Spinner variant="secondary"/></div>
                    ) : recentActivity.length > 0 ? (
                        <div className="space-y-2">
                            {recentActivity.map(record => (
                                <Link to={`/patients/${record.patientId}`} key={record.id} className="block p-3 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-white rounded-full mr-4 border border-slate-200"><RecordTypeIcon type={record.type}/></div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{record.title}</p>
                                            <p className="text-sm text-slate-500">
                                                For <span className="font-semibold text-slate-600">{record.patientName}</span> on {new Date(record.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-8 text-slate-500">No recent activity found.</div>
                    )}
                </Card>
            </div>
        </>
    );
};

export default DashboardPage;