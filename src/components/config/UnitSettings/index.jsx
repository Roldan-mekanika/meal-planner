// src/components/config/UnitSettings/index.jsx
import React from 'react';
import { UNIT_SYSTEMS } from '../../../config/units';

const UnitSettings = () => {
  const [selectedSystem, setSelectedSystem] = React.useState(() => 
    localStorage.getItem('unitSystem') || UNIT_SYSTEMS.METRIC
  );

  const handleSystemChange = (system) => {
    setSelectedSystem(system);
    localStorage.setItem('unitSystem', system);
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h2 className="text-lg font-medium text-sage-900 mb-4">
        Système d'unités
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium text-sage-800">Système de mesure</span>
            <p className="text-sm text-sage-600">
              Choisissez entre le système métrique (g, ml) ou américain (oz, cups)
            </p>
          </div>
          <div className="flex gap-3">
            {Object.values(UNIT_SYSTEMS).map((system) => (
              <button
                key={system}
                onClick={() => handleSystemChange(system)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                  ${selectedSystem === system
                    ? 'bg-earth-600 text-white'
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                  }`}
              >
                {system === UNIT_SYSTEMS.METRIC ? 'Métrique' : 'Américain'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitSettings;