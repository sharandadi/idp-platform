import React from 'react';

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`p-3 rounded-xl transition-all ${active
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                }`}
        >
            {icon}
        </button>
    );
};