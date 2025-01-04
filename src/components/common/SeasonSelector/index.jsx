// src/components/common/SeasonSelector/index.jsx
import React from 'react';
import { months } from '../../../config/categories';

const SeasonSelector = ({ selectedMonths = [], onChange }) => {
  const toggleMonth = (monthId) => {
    const newSelection = selectedMonths.includes(monthId)
      ? selectedMonths.filter(id => id !== monthId)
      : [...selectedMonths, monthId];
    onChange(newSelection);
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {months.map(month => (
        <button
          key={month.id}
          type="button"
          onClick={() => toggleMonth(month.id)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
            ${selectedMonths.includes(month.id)
              ? 'bg-earth-100 text-earth-700'
              : 'bg-sage-50 text-sage-700 hover:bg-sage-100'
            }`}
        >
          {month.name}
        </button>
      ))}
    </div>
  );
};

export default SeasonSelector;