// FIX: Create content for missing file to resolve module not found errors.
import React, { useEffect, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Layout';
import { Card, Input, Button, Select, Textarea, Spinner } from '../components/UI';
import { getPatient, addPatient, updatePatient } from '../services/api';
import { Patient } from '../types';
import { ChevronLeftIcon } from '../components/Icons';
import { AppContext } from '../App';


type FormData = Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'qrCodeData'>;

const PatientFormPage: React.FC = () => {
    const { user, refreshData, addToast } = useContext(AppContext);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>();
    const isEditing = Boolean(id);
    const [isLoadingPatient, setIsLoadingPatient] = useState(isEditing);
    
    useEffect(() => {
        if (user?.role !== 'doctor') {
            addToast({ message: "You don't have permission to perform this action.", type: 'error' });
            navigate('/patients');
        }
    }, [user, navigate, addToast]);

    useEffect(() => {
        if (isEditing) {
            const fetchPatient = async () => {
                setIsLoadingPatient(true);
                try {
                    const patient = await getPatient(id!);
                    if (patient) {
                        setValue('name', patient.name);
                        setValue('dob', patient.dob);
                        setValue('gender', patient.gender);
                        setValue('contact', patient.contact);
                        setValue('address', patient.address);
                        setValue('status', patient.status);
                        setValue('idProofType', patient.idProofType);
                        setValue('idProofNumber', patient.idProofNumber);
                        setValue('insuranceProvider', patient.insuranceProvider);
                        setValue('insurancePolicyNumber', patient.insurancePolicyNumber);
                    } else {
                        addToast({ message: 'Patient not found.', type: 'error' });
                        navigate('/patients');
                    }
                } catch (error) {
                    addToast({ message: 'Failed to fetch patient data.', type: 'error' });
                    console.error("Failed to fetch patient:", error);
                } finally {
                    setIsLoadingPatient(false);
                }
            };
            fetchPatient();
        }
    }, [id, isEditing, setValue, navigate, addToast]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEditing) {
                await updatePatient(id!, data);
                addToast({ message: 'Patient details updated successfully!', type: 'success' });
            } else {
                await addPatient(data);
                addToast({ message: 'Patient added successfully!', type: 'success' });
            }
            await refreshData(); // Refresh global state
            navigate('/patients');
        } catch (error) {
            console.error("Failed to save patient:", error);
            addToast({ message: 'Failed to save patient. Please try again.', type: 'error' });
        }
    };

    return (
        <>
            <Header title={isEditing ? "Edit Patient" : "Add New Patient"}>
                 <Link to={isEditing ? `/patients/${id}` : '/patients'}>
                    <Button variant="secondary">
                        <ChevronLeftIcon className="h-5 w-5 mr-1" />
                        Back
                    </Button>
                </Link>
            </Header>
            <div className="p-4">
                <Card>
                    {isLoadingPatient ? (
                        <div className="flex justify-center items-center h-64"><Spinner variant="secondary"/></div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Personal Details Section */}
                            <fieldset className="space-y-4">
                                <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Personal Details</legend>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                    <Input {...register('name', { required: 'Name is required' })} />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Date of Birth</label>
                                        <Input type="date" {...register('dob', { required: 'Date of birth is required' })} />
                                        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                                        <Select {...register('gender', { required: 'Gender is required' })}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </Select>
                                        {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Contact Number</label>
                                    <Input {...register('contact', { required: 'Contact number is required' })} />
                                    {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Address</label>
                                    <Textarea {...register('address', { required: 'Address is required' })} rows={3} />
                                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                                </div>
                            </fieldset>

                            {/* Identification & Insurance Section */}
                            <fieldset className="space-y-4">
                                <legend className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-2">Identification & Insurance</legend>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">ID Proof Type</label>
                                        <Select {...register('idProofType')}>
                                            <option value="">Select ID Type</option>
                                            <option value="Aadhaar">Aadhaar</option>
                                            <option value="PAN Card">PAN Card</option>
                                            <option value="Passport">Passport</option>
                                            <option value="Voter ID">Voter ID</option>
                                            <option value="Driving License">Driving License</option>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">ID Proof Number</label>
                                        <Input {...register('idProofNumber')} placeholder="e.g., 1234 5678 9012" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Insurance Provider</label>
                                        <Input {...register('insuranceProvider')} placeholder="e.g., MediCare Plus" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Policy Number</label>
                                        <Input {...register('insurancePolicyNumber')} placeholder="e.g., MCP987654321" />
                                    </div>
                                </div>
                            </fieldset>

                            {/* Status Section */}
                            <fieldset>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                                <Select {...register('status', { required: 'Status is required' })}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Select>
                                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                            </fieldset>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" isLoading={isSubmitting}>
                                    {isEditing ? 'Save Changes' : 'Add Patient'}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </>
    );
};

export default PatientFormPage;