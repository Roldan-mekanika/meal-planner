// src/components/config/Settings/index.jsx
import React from 'react';

const UNIT_SYSTEMS = {
  WEIGHTS: {
    METRIC: 'metric_weights',
    IMPERIAL: 'imperial_weights'
  },
  VOLUMES: {
    METRIC: 'metric_volumes',
    IMPERIAL: 'imperial_volumes'
  }
};

const Settings = () => {
  const [weightSystem, setWeightSystem] = React.useState(() => 
    localStorage.getItem('weightSystem') || UNIT_SYSTEMS.WEIGHTS.METRIC
  );

  const [volumeSystem, setVolumeSystem] = React.useState(() => 
    localStorage.getItem('volumeSystem') || UNIT_SYSTEMS.VOLUMES.METRIC
  );

  const handleWeightSystemChange = (system) => {
    setWeightSystem(system);
    localStorage.setItem('weightSystem', system);
  };

  const handleVolumeSystemChange = (system) => {
    setVolumeSystem(system);
    localStorage.setItem('volumeSystem', system);
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h2 className="text-lg font-medium text-sage-900 mb-6">
        Système d'unités
      </h2>
      
      {/* Système de poids */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-sage-800 mb-2">Unités de poids</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleWeightSystemChange(UNIT_SYSTEMS.WEIGHTS.METRIC)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${weightSystem === UNIT_SYSTEMS.WEIGHTS.METRIC
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              Métrique (g, kg)
            </button>
            <button
              onClick={() => handleWeightSystemChange(UNIT_SYSTEMS.WEIGHTS.IMPERIAL)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${weightSystem === UNIT_SYSTEMS.WEIGHTS.IMPERIAL
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              Impérial (oz, lb)
            </button>
          </div>
        </div>
        
        {/* Système de volume */}
        <div>
          <h3 className="text-sm font-medium text-sage-800 mb-2">Unités de volume</h3>
          <div className="flex gap-3">
            <button
              onClick={() => handleVolumeSystemChange(UNIT_SYSTEMS.VOLUMES.METRIC)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${volumeSystem === UNIT_SYSTEMS.VOLUMES.METRIC
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              Métrique (ml, l)
            </button>
            <button
              onClick={() => handleVolumeSystemChange(UNIT_SYSTEMS.VOLUMES.IMPERIAL)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${volumeSystem === UNIT_SYSTEMS.VOLUMES.IMPERIAL
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              Impérial (cups, fl oz)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;