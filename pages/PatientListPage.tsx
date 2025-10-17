import React, { useState, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout';
import { Card, Input, Button, Spinner } from '../components/UI';
import { Patient } from '../types';
import { PlusIcon, SearchIcon, ViewIcon, EditIcon, TrashIcon } from '../components/Icons';
import { AppContext } from '../App';

const PatientListPage: React.FC = () => {
    const { user, patients, loading } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [patients, searchTerm]);
    
    const isReadOnly = user?.role !== 'doctor';

    return (
        <>
            <Header title="Patient Records" />
            <div className="p-4 space-y-4">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"/>
                    <Input
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64"><Spinner variant="secondary"/></div>
                ) : filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                        <PatientCard key={patient.id} patient={patient} isReadOnly={isReadOnly} />
                    ))
                ) : (
                     <div className="text-center p-8 text-slate-500 bg-white rounded-lg">No patients found.</div>
                )}
            </div>
             {!isReadOnly && (
                <Link to="/patients/new" className="fixed bottom-20 right-5">
                    <Button className="rounded-full !p-4 shadow-lg">
                        <PlusIcon className="h-6 w-6" />
                    </Button>
                </Link>
            )}
        </>
    );
};

const PatientCard: React.FC<{patient: Patient; isReadOnly: boolean}> = ({ patient, isReadOnly }) => {
    const navigate = useNavigate();
    
    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">{patient.name}</h3>
                    <p className="text-sm text-slate-500">ID: {patient.id}</p>
                </div>
                 <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${patient.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {patient.status}
                </span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                 <div className="text-sm">
                    <p className="text-slate-600"><strong>Gender:</strong> {patient.gender}</p>
                    <p className="text-slate-600"><strong>Contact:</strong> {patient.contact}</p>
                 </div>
                 <div className="flex items-center space-x-1">
                    <Button variant="secondary" onClick={() => navigate(`/patients/${patient.id}`)} className="!p-2"><ViewIcon className="h-5 w-5"/></Button>
                    {!isReadOnly && (
                        <>
                            <Button variant="secondary" onClick={() => navigate(`/patients/${patient.id}/edit`)} className="!p-2"><EditIcon className="h-5 w-5"/></Button>
                             {/* The actual delete confirmation and logic is on the detail page */}
                            <Button variant="secondary" onClick={() => navigate(`/patients/${patient.id}`)} className="!p-2"><TrashIcon className="h-5 w-5 text-red-500"/></Button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};


export default PatientListPage;