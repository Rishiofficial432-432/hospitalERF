
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, PatientIcon, QRIcon, LogoutIcon } from './Icons';
import { AppContext } from '../App';

// Main Mobile Layout
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex flex-col h-full bg-slate-100 font-sans">
            <main className="flex-1 overflow-y-auto pb-16">
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

// Bottom Navigation Bar
const BottomNav: React.FC = () => {
    const { logout } = useContext(AppContext);
    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 flex justify-around items-center h-16 shadow-top z-10">
            <NavItem to="/dashboard" icon={<DashboardIcon className="h-6 w-6" />}>Dashboard</NavItem>
            <NavItem to="/patients" icon={<PatientIcon className="h-6 w-6" />}>Patients</NavItem>
            <NavItem to="/qr-management" icon={<QRIcon className="h-6 w-6" />}>Scan QR</NavItem>
            <button 
                onClick={logout} 
                className="flex flex-col items-center justify-center text-xs font-medium transition-colors w-full h-full text-slate-500 hover:text-cyan-600"
                aria-label="Logout"
            >
                <LogoutIcon className="h-6 w-6" />
                <span className="mt-1">Logout</span>
            </button>
        </nav>
    );
};

// Bottom NavItem
interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}
const NavItem: React.FC<NavItemProps> = ({ to, icon, children }) => {
    const baseClasses = "flex flex-col items-center justify-center text-xs font-medium transition-colors w-full h-full";
    const inactiveClasses = "text-slate-500 hover:text-cyan-600";
    const activeClasses = "text-cyan-600";

    return (
        <NavLink
            to={to}
            end
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {icon}
            <span className="mt-1">{children}</span>
        </NavLink>
    );
};

// Header
export const Header: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => {
    return (
        <header className="bg-white p-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <div>{children}</div>
        </header>
    );
};
