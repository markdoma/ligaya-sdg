import React from 'react';

const AttendanceModal = ({ onClose, eventSummary, name }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-overlay fixed inset-0 bg-black opacity-50"></div>
      <div className="modal-container bg-white w-96 mx-auto rounded shadow-lg z-50">
        <div className="modal-content p-4 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">Success!</h2>
          <p className="text-center">
            {name
              ? `${name}, we have successfully saved your attendance for ${eventSummary}! `
              : 'The details have been successfully saved!'}
          </p>
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;
