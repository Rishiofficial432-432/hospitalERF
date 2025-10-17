import React from 'react';
import { Card } from './UI';
import { DownloadIcon, PrintIcon } from './Icons';
import { Patient } from '../types';

interface QRCodeDisplayProps {
    data: string;
    size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ data, size = 150 }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
    return <img src={qrUrl} alt="QR Code" width={size} height={size} />;
};

interface PatientQRCardProps {
    patient: Patient;
}

export const PatientQRCard: React.FC<PatientQRCardProps> = ({ patient }) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(patient.qrCodeData)}`;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = `qr-code-${patient.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Print QR Code</title></head>
                    <body style="text-align: center; margin-top: 50px; font-family: sans-serif;">
                        <h2>${patient.name} (ID: ${patient.id})</h2>
                        <img src="${qrUrl}" alt="QR Code" />
                        <script>window.onload = function() { window.print(); window.close(); }</script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };


    return (
        <Card className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-2 text-cyan-600">{patient.name}</h3>
            <p className="text-sm text-slate-500 mb-4">ID: {patient.id}</p>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
                <QRCodeDisplay data={patient.qrCodeData} size={200} />
            </div>
            <div className="mt-4 flex space-x-2">
                <button onClick={handleDownload} className="flex items-center text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-md hover:bg-slate-200 transition-colors">
                    <DownloadIcon className="h-4 w-4 mr-1" /> Download
                </button>
                 <button onClick={handlePrint} className="flex items-center text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-md hover:bg-slate-200 transition-colors">
                    <PrintIcon className="h-4 w-4 mr-1" /> Print
                </button>
            </div>
        </Card>
    );
};