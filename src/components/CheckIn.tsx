import React, { useState } from 'react';

const CheckIn = ({ hospitalId, onClose }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (activity_level) => {
    setSubmitting(true);
    await fetch('/api/update_pulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hospital_id: hospitalId, activity_level }),
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-white">
        <h2 className="text-2xl font-bold mb-4">How busy is it?</h2>
        <div className="flex justify-around gap-4">
          <button onClick={() => handleSubmit('quiet')} disabled={submitting} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Quiet</button>
          <button onClick={() => handleSubmit('moderate')} disabled={submitting} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Moderate</button>
          <button onClick={() => handleSubmit('busy')} disabled={submitting} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Busy</button>
        </div>
        <button onClick={onClose} disabled={submitting} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded">Cancel</button>
      </div>
    </div>
  );
};

export default CheckIn;