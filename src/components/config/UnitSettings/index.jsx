import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import { UNIT_SYSTEMS } from '../../../config/units';

const UnitSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    weightSystem: UNIT_SYSTEMS.WEIGHTS.METRIC,
    volumeSystem: UNIT_SYSTEMS.VOLUMES.METRIC
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Charger les préférences depuis localStorage
    const savedWeightSystem = localStorage.getItem('weightSystem') || UNIT_SYSTEMS.WEIGHTS.METRIC;
    const savedVolumeSystem = localStorage.getItem('volumeSystem') || UNIT_SYSTEMS.VOLUMES.METRIC;
    setSettings({
      weightSystem: savedWeightSystem,
      volumeSystem: savedVolumeSystem
    });
  }, []);

  const handleSystemChange = async (type, system) => {
    try {
      setSaving(true);
      
      const newSettings = {
        ...settings,
        [type]: system
      };

      // Mettre à jour localStorage
      localStorage.setItem(type === 'weightSystem' ? 'weightSystem' : 'volumeSystem', system);

      // Mettre à jour Firestore
      const userDoc = doc(db, 'users', user.uid);
      await updateDoc(userDoc, {
        [`preferences.${type}`]: system
      });

      setSettings(newSettings);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <h2 className="text-xl font-semibold text-sage-900 mb-6">
        Système d'unités
      </h2>
      
      <div className="space-y-8">
        {/* Système de poids */}
        <div>
          <h3 className="text-lg font-medium text-sage-800 mb-4">
            Unités de poids
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleSystemChange('weightSystem', UNIT_SYSTEMS.WEIGHTS.METRIC)}
              disabled={saving}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200
                ${settings.weightSystem === UNIT_SYSTEMS.WEIGHTS.METRIC
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              <div className="font-bold mb-1">Métrique</div>
              <div className="text-xs">grammes (g), kilogrammes (kg)</div>
            </button>
            
            <button
              onClick={() => handleSystemChange('weightSystem', UNIT_SYSTEMS.WEIGHTS.IMPERIAL)}
              disabled={saving}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200
                ${settings.weightSystem === UNIT_SYSTEMS.WEIGHTS.IMPERIAL
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              <div className="font-bold mb-1">Impérial</div>
              <div className="text-xs">onces (oz), livres (lb)</div>
            </button>
          </div>
        </div>

        {/* Système de volume */}
        <div>
          <h3 className="text-lg font-medium text-sage-800 mb-4">
            Unités de volume
          </h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleSystemChange('volumeSystem', UNIT_SYSTEMS.VOLUMES.METRIC)}
              disabled={saving}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200
                ${settings.volumeSystem === UNIT_SYSTEMS.VOLUMES.METRIC
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              <div className="font-bold mb-1">Métrique</div>
              <div className="text-xs">millilitres (ml), litres (l)</div>
            </button>
            
            <button
              onClick={() => handleSystemChange('volumeSystem', UNIT_SYSTEMS.VOLUMES.IMPERIAL)}
              disabled={saving}
              className={`flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200
                ${settings.volumeSystem === UNIT_SYSTEMS.VOLUMES.IMPERIAL
                  ? 'bg-earth-600 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
            >
              <div className="font-bold mb-1">Impérial</div>
              <div className="text-xs">cups, tablespoons (tbsp), teaspoons (tsp)</div>
            </button>
          </div>
        </div>

        {/* Feedback de sauvegarde */}
        {saving && (
          <div className="text-sm text-sage-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-earth-600"></div>
            Enregistrement des préférences...
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitSettings;