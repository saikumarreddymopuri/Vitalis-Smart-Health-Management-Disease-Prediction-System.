import React from 'react';
import { FaBed } from 'react-icons/fa';

const BedAvailability = ({ data }) => {
  const bedTypes = ['general', 'icu', 'ventilator', 'deluxe'];
  const bedData = bedTypes.map(type => {
    const found = data.find(d => d.type === type);
    return {
      type: type,
      count: found ? found.count : 0,
    };
  });
  
  const colors = {
    general: 'text-blue-400',
    icu: 'text-red-400',
    ventilator: 'text-orange-400',
    deluxe: 'text-purple-400',
  };

  // --- NEW: Removed h-80, added new glowing/flashing styles ---
  return (
    <div className="bg-blue-900/40 border border-blue-500/50 p-5 rounded-2xl shadow-2xl animate-pulse flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FaBed className="text-cyan-400" />
        Live Bed Availability
      </h3>
      <div className="space-y-4 flex-grow">
        {bedData.map(bed => (
          <div key={bed.type} className="flex justify-between items-center">
            <span className={`capitalize font-medium ${colors[bed.type] || 'text-gray-300'}`}>
              {bed.type}
            </span>
            <span className="text-2xl font-bold text-white">{bed.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BedAvailability;