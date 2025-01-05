import React, { useEffect, useState } from 'react';
import { Prompt, useLocation } from 'react-router-dom';

const NavigationGuard = ({ isFormDirty }) => {
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(true);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isFormDirty) {
        event.preventDefault();
        event.returnValue = 'Voulez-vous vraiment quitter ? Les modifications non enregistrées seront perdues.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormDirty]);

  return (
    <Prompt
      when={isFormDirty && showPrompt}
      message="Voulez-vous vraiment quitter ? Les modifications non enregistrées seront perdues."
    />
  );
};

export default NavigationGuard;