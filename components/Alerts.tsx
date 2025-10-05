import React, { useState } from 'react';
import { getMockAlerts } from '../services/mockData';
import type { Alert } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${className}`}>
        {children}
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 ${
            checked ? 'bg-blue-600' : 'bg-gray-600'
        }`}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
    >
        <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
                checked ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
    </button>
);


const Alerts: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>(getMockAlerts());

    const handleToggle = (id: number) => {
        setAlerts(prevAlerts =>
            prevAlerts.map(alert =>
                alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
            )
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-white">Alert Configuration</h1>
                 <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    + New Alert Rule
                </button>
            </div>
            <Card>
                <div className="divide-y divide-gray-700/50">
                    {alerts.map(alert => (
                        <div key={alert.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                            <div>
                                <h3 className={`font-semibold transition-colors ${alert.enabled ? 'text-white' : 'text-gray-400'}`}>{alert.title}</h3>
                                <p className={`text-sm transition-colors ${alert.enabled ? 'text-gray-400' : 'text-gray-500'}`}>{alert.description}</p>
                            </div>
                            <ToggleSwitch checked={alert.enabled} onChange={() => handleToggle(alert.id)} />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Alerts;