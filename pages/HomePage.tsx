// FIX: Create content for missing file to resolve module not found errors.
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Welcome to MediQR</h1>
            <p className="text-slate-600 mb-8">This is the main entry point, but you will be redirected shortly.</p>
            <Link to="/dashboard">
                <button className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow hover:bg-cyan-600 transition-colors">
                    Go to Dashboard
                </button>
            </Link>
        </div>
    );
};

export default HomePage;
