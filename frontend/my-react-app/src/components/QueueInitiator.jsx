// components/QueueInitiator.jsx
import React, { useState } from 'react';
import { startDataCollection } from '../services/moistureSensorService';

const QueueInitiator = ({ onFetchData }) => {
  const [queue, setQueue] = useState('');

  const handleInputChange = (e) => setQueue(e.target.value);

  const handleStartCollection = async () => {
    if (!queue) return console.error("Queue ID is missing");
    try {
      await startDataCollection(queue);
      console.log("Data collection started for Queue:", queue);
    } catch (error) {
      console.error("Error starting data collection:", error);
    }
  };

  const handleInterfaceData = () => {
    if (!queue) return console.error("Queue ID is missing");
    console.log("Interface Data clicked for Queue:", queue);
    // TODO: ใส่ logic ที่ต้องการเวลา Interface Data กด
  };

  return (
    <div className="text-center">
      <input
        type="text"
        value={queue}
        onChange={handleInputChange}
        className="p-2 border rounded mt-2"
        placeholder="Queue ID"
      />
      <div className="flex justify-center mt-2 gap-2">
        <button onClick={handleStartCollection} className="p-2 bg-green-500 text-white rounded">Start Data Collection</button>
        <button onClick={handleFetchData} className="p-2 bg-yellow-400 text-gray-800 rounded">Fetch Data</button>
      </div>
    </div>
  );
};

export default QueueInitiator;
