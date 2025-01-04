// src/components/planning/ServingsControl/index.jsx
import React from 'react';

const ServingsControl = ({ value, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="p-1 text-sage-400 hover:text-earth-600 rounded-full 
          hover:bg-sage-50 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || 1;
          onChange(Math.max(1, newValue));
        }}
        className="w-12 text-center rounded-lg border-sage-300 text-sm
          focus:border-earth-500 focus:ring-earth-500 p-1"
        min="1"
      />
      
      <button
        onClick={() => onChange(value + 1)}
        className="p-1 text-sage-400 hover:text-earth-600 rounded-full 
          hover:bg-sage-50 transition-colors duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default ServingsControl;