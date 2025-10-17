// FIX: Create content for missing file to resolve module not found errors.
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Header } from '../components/Layout';
import { Card, Button, Spinner, Modal, Input, Select, Textarea } from '../components/UI';
import { ChevronLeftIcon, EditIcon, TrashIcon, PlusIcon, FileTextIcon, BeakerIcon, PillIcon } from '../components/Icons';
import { deletePatient, addMedicalRecord, deleteMedicalRecord } from '../services/api';
import { MedicalRecord, MedicalRecordType } from '../types';
import { PatientQRCard } from '../components/QRCode';
import { AppContext } from '../App';

type MedicalRecordFormData = Omit<MedicalRecord, 'id' | 'date' | 'patientId' | 'doctorName'>;
type SortOption = 'date-desc' | 'date-asc' | 'type-asc';

const PatientDetailPage: React.FC = () => {
    const { user, patients, records, loading, refreshData, addToast } = useContext(AppContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [patient, patientRecords] = useMemo(() => {
        const currentPatient = patients.find(p => p.id === id);
        const currentRecords = records.filter(r => r.patientId === id);
        return [currentPatient, currentRecords];
    }, [id, patients, records]);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRecordModalOpen, setRecordModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    
    useEffect(() => {
        if (!loading && !patient) {
            addToast({ message: "Patient not found.", type: 'error'});
            navigate('/patients');
        }
    }, [loading, patient, navigate, addToast]);


    const sortedRecords = useMemo(() => {
        const sorted = [...patientRecords];
        switch (sortOption) {
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            case 'type-asc':
                return sorted.sort((a, b) => {
                    if (a.type < b.type) return -1;
                    if (a.type > b.type) return 1;
                    return new Date(b.date).getTime() - new Date(a.date).getTime(); // secondary sort
                });
            case 'date-desc':
            default:
                return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    }, [patientRecords, sortOption]);

    const handleDeletePatient = async () => {
        if (!patient) return;
        setIsDeleting(true);
        try {
            await deletePatient(patient.id);
            await refreshData();
            addToast({ message: `Patient ${patient.name} deleted successfully.`, type: 'success' });
            navigate('/patients');
        } catch (error) { 
            console.error("Failed to delete patient:", error); 
            addToast({ message: "Failed to delete patient.", type: 'error' });
            setIsDeleting(false);
        }
    };

    const handleAddRecord = async (data: MedicalRecordFormData) => {
        if (!patient || !user) return;
        try {
            const newRecordData = { ...data, patientId: patient.id, doctorName: user.name };
            await addMedicalRecord(newRecordData);
            setRecordModalOpen(false);
            await refreshData();
            addToast({ message: 'Medical record added successfully.', type: 'success' });
        } catch (error) {
            console.error("Failed to add record:", error);
            addToast({ message: "Failed to add record.", type: 'error' });
        }
    };

    const handleDeleteRecord = async () => {
        if (!recordToDelete) return;
        try {
            await deleteMedicalRecord(recordToDelete.id);
            setRecordToDelete(null);
            await refreshData();
            addToast({ message: 'Medical record deleted successfully.', type: 'success' });
        } catch (error) {
            console.error("Failed to delete record:", error);
            addToast({ message: "Failed to delete record.", type: 'error' });
        }
    };
    
    const isReadOnly = user?.role !== 'doctor';

    if (loading || !patient) {
        return <div className="flex justify-center items-center h-full"><Spinner variant="secondary"/></div>;
    }

    return (
        <>
            <Header title="Patient Details">
                <Link to="/patients">
                    <Button variant="secondary">
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        Back to List
                    </Button>
                </Link>
            </Header>
            <div className="p-4 space-y-4">
                <Card>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
                            <p className="text-sm text-slate-500">ID: {patient.id}</p>
                        </div>
                        {!isReadOnly && (
                            <div className="flex space-x-2">
                                <Link to={`/patients/${patient.id}/edit`}>
                                    <Button variant="secondary"><EditIcon className="h-4 w-4 mr-2"/>Edit</Button>
                                </Link>
                                <Button variant="danger" onClick={() => setDeleteModalOpen(true)}><TrashIcon className="h-4 w-4 mr-2"/>Delete</Button>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 border-t border-slate-200 pt-4 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                        <DetailItem label="Date of Birth" value={new Date(patient.dob).toLocaleDateString()} />
                        <DetailItem label="Gender" value={patient.gender} />
                        <DetailItem label="Contact" value={patient.contact} />
                        <DetailItem label="Status">
                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${patient.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {patient.status}
                            </span>
                        </DetailItem>
                        <DetailItem label="Address" value={patient.address} className="col-span-2" />
                        <hr className="col-span-2 my-2 border-slate-200" />
                        <DetailItem label="ID Proof" value={patient.idProofType || 'N/A'} />
                        <DetailItem label="ID Number" value={patient.idProofNumber || 'N/A'} />
                        <DetailItem label="Insurance Provider" value={patient.insuranceProvider || 'N/A'} />
                        <DetailItem label="Policy Number" value={patient.insurancePolicyNumber || 'N/A'} />
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-700">Medical History</h3>
                        {!isReadOnly && <Button onClick={() => setRecordModalOpen(true)}><PlusIcon className="h-4 w-4 mr-2"/> Add Record</Button>}
                    </div>
                    {patientRecords.length > 0 && (
                        <div className="flex items-center mb-4 pb-4 border-b border-slate-200">
                            <label htmlFor="sort-records" className="text-sm font-medium text-slate-600 mr-2">Sort by:</label>
                            <Select
                                id="sort-records"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value as SortOption)}
                                className="w-auto text-sm !py-1"
                            >
                                <option value="date-desc">Date (Newest First)</option>
                                <option value="date-asc">Date (Oldest First)</option>
                                <option value="type-asc">Type</option>
                            </Select>
                        </div>
                    )}
                    {sortedRecords.length > 0 ? (
                         <div className="space-y-3">
                             {sortedRecords.map(record => <MedicalRecordItem key={record.id} record={record} isReadOnly={isReadOnly} onDelete={() => setRecordToDelete(record)}/>)}
                         </div>
                     ) : (
                         <p className="text-center text-slate-500 py-4">No medical records found for this patient.</p>
                     )}
                </Card>

                <PatientQRCard patient={patient} />
            </div>

            {/* Modals */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion" titleClassName="text-red-600" footer={<><Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button><Button variant="danger" onClick={handleDeletePatient} isLoading={isDeleting}>Delete</Button></>}>
                Are you sure you want to delete patient <span className="font-semibold">{patient?.name}</span>? This action cannot be undone.
            </Modal>
            
            <MedicalRecordFormModal isOpen={isRecordModalOpen} onClose={() => setRecordModalOpen(false)} onSubmit={handleAddRecord} />

            <Modal isOpen={!!recordToDelete} onClose={() => setRecordToDelete(null)} title="Confirm Record Deletion" titleClassName="text-red-600" footer={<><Button variant="secondary" onClick={() => setRecordToDelete(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteRecord}>Delete</Button></>}>
                Are you sure you want to delete the record titled "<span className="font-semibold">{recordToDelete?.title}</span>"?
            </Modal>
        </>
    );
};

const DetailItem: React.FC<{ label: string, value?: string, children?: React.ReactNode, className?: string }> = ({ label, value, children, className }) => (
    <div className={className}>
        <p className="font-semibold text-slate-600">{label}</p>
        {value && <p className="text-slate-800 truncate">{value}</p>}
        {children}
    </div>
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

const MedicalRecordItem: React.FC<{record: MedicalRecord, isReadOnly: boolean, onDelete: () => void}> = ({ record, isReadOnly, onDelete }) => {
    return (
        <div className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="p-2 bg-white rounded-full mr-4 border border-slate-200"><RecordTypeIcon type={record.type}/></div>
            <div className="flex-1">
                <p className="font-semibold text-slate-800">{record.title}</p>
                <p className="text-sm text-slate-500">{record.type} on {new Date(record.date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600 mt-1">{record.details}</p>
            </div>
            {!isReadOnly && (
                <button onClick={onDelete} className="text-slate-400 hover:text-red-500 p-1 ml-2">
                    <TrashIcon className="h-4 w-4"/>
                </button>
            )}
        </div>
    );
};

interface MedicalRecordFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: MedicalRecordFormData) => void;
}
const MedicalRecordFormModal: React.FC<MedicalRecordFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MedicalRecordFormData>();
    
    const handleFormSubmit = (data: MedicalRecordFormData) => {
        onSubmit(data);
        reset();
    };

    useEffect(() => {
        if (!isOpen) reset();
    }, [isOpen, reset]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Medical Record" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit(handleFormSubmit)} isLoading={isSubmitting}>Save Record</Button></>}>
            <form className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Record Type</label>
                    <Select {...register('type', { required: 'Type is required' })}>
                        <option value="Consultation">Consultation</option>
                        <option value="Lab Report">Lab Report</option>
                        <option value="Prescription">Prescription</option>
                        <option value="Note">Note</option>
                    </Select>
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                    <Input {...register('title', { required: 'Title is required' })} />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Details</label>
                    <Textarea {...register('details', { required: 'Details are required' })} rows={4} />
                    {errors.details && <p className="text-red-500 text-xs mt-1">{errors.details.message}</p>}
                </div>
            </form>
        </Modal>
    )
}

export default PatientDetailPage;