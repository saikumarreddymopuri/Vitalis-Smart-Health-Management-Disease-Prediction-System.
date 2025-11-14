import React from 'react';
import { FaAmbulance } from 'react-icons/fa';

const AmbulanceAvailability = ({ data }) => {
  const ambTypes = ['basic', 'icu', 'ac', 'non-ac'];
  const ambData = ambTypes.map(type => {
    const found = data.find(d => d.type === type);
    return {
      type: type,
      count: found ? found.count : 0,
    };
  });
  
  const colors = {
    basic: 'text-blue-400',
    icu: 'text-red-400',
    ac: 'text-green-400',
    'non-ac': 'text-gray-400',
  };

  // --- NEW: Removed h-80, added new glowing/flashing styles ---
  return (
    <div className="bg-fuchsia-900/40 border border-fuchsia-500/50 p-5 rounded-2xl shadow-2xl animate-pulse flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FaAmbulance className="text-fuchsia-300" />
        Live Ambulance Availability
      </h3>
      <div className="space-y-4 flex-grow">
        {ambData.map(amb => (
          <div key={amb.type} className="flex justify-between items-center">
            <span className={`capitalize font-medium ${colors[amb.type] || 'text-gray-300'}`}>
              {amb.type}
            </span>
            <span className="text-2xl font-bold text-white">{amb.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbulanceAvailability;