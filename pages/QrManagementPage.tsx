
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Layout';
import { Card, Button } from '../components/UI';
import { QRIcon, UploadIcon } from '../components/Icons';
import { getPatient } from '../services/api';
import { Patient } from '../types';
import { PatientQRCard } from '../components/QRCode';

const QrManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScanResult = async (data: string) => {
        setIsLoading(true);
        setError(null);
        setPatient(null);

        try {
            // Assuming data is in format 'patient_id=p001&name=JohnDoe'
            const params = new URLSearchParams(data);
            const patientId = params.get('patient_id');

            if (!patientId) {
                throw new Error("Invalid QR code data. Patient ID not found.");
            }
            
            const fetchedPatient = await getPatient(patientId);

            if (fetchedPatient) {
                setPatient(fetchedPatient);
            } else {
                throw new Error(`Patient with ID "${patientId}" not found.`);
            }

        } catch (e: any) {
            setError(e.message || "Failed to process QR code.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setPatient(null);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('https://api.qrserver.com/v1/read-qr-code/', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            
            if (result && result[0] && result[0].symbol[0] && result[0].symbol[0].data) {
                await handleScanResult(result[0].symbol[0].data);
            } else if (result[0].symbol[0].error) {
                throw new Error(result[0].symbol[0].error);
            } else {
                 throw new Error("Could not decode QR code from the image.");
            }

        } catch (e: any) {
            setError(e.message || "An error occurred while reading the QR code.");
            setIsLoading(false);
        }
    };
    
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    
    const resetScanner = () => {
        setPatient(null);
        setError(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <>
            <Header title="QR Code Management" />
            <div className="p-4 flex justify-center">
                <div className="w-full max-w-md">
                    <Card>
                        <div className="flex flex-col items-center text-center">
                           <QRIcon className="h-16 w-16 text-cyan-500 mb-4"/>
                            <h2 className="text-xl font-semibold text-slate-700">Scan Patient QR Code</h2>
                            <p className="text-slate-500 mt-1 mb-6">Upload an image of a QR code to find patient details.</p>
                            
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            
                            <Button onClick={handleButtonClick} isLoading={isLoading}>
                                <UploadIcon className="h-5 w-5 mr-2" />
                                {isLoading ? 'Processing...' : 'Upload QR Code Image'}
                            </Button>
                        </div>
                    </Card>

                    {error && (
                        <Card className="mt-4 border-red-300 bg-red-50 text-center">
                            <p className="text-red-600 font-medium">Error</p>
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                            <Button variant="secondary" onClick={resetScanner} className="mt-4">Try Again</Button>
                        </Card>
                    )}

                    {patient && (
                        <div className="mt-4">
                            <PatientQRCard patient={patient} />
                             <div className="mt-4 flex space-x-2">
                                <Button className="w-full" onClick={() => navigate(`/patients/${patient.id}`)}>View Full Details</Button>
                                <Button variant="secondary" className="w-full" onClick={resetScanner}>Scan Another</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default QrManagementPage;
