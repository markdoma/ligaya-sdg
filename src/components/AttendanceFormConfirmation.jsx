import React from 'react'

const AttendanceFormConfirmation = ({ data, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Confirm Your Information</h2>
        <p className="mb-4">
          Please review the information you provided and confirm if it&apos;s
          correct.
        </p>
        <div className="mb-2">
          <p className="font-bold">Surname:</p>
          <p>{data.lastname}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">Name:</p>
          <p>{data.firstname}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">Gener:</p>
          <p>{data.gender}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">Date of Birth:</p>
          <p>{data.birthdate}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">Address:</p>
          <p>{data.address}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">Status:</p>
          <p>{data.civilstatus}</p>
        </div>
        <div className="mb-2">
          <p className="font-bold">Invited By:</p>
          <p>{data.invitedBy}</p>
        </div>
        <div className="mb-10">
          <p className="font-bold">
            First time to attend:{' '}
            <span className="text-red-800">{data.first.toUpperCase()}</span>
          </p>
          {/* <p>{data.first}</p> */}
        </div>
        {/* Add more fields as needed */}
        <div className="flex justify-between">
          <button
            className="focus:shadow-outline mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none"
            onClick={onClose}
          >
            Edit
          </button>
        </div>
        <div className="m-4">
          <p className="text-sm italic text-gray-600">
            Disclaimer: The information you provide will solely be used for
            Ligaya ng Panginoon purposes. We prioritize data privacy and do not
            share your data with third parties.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AttendanceFormConfirmation
