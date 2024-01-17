'use client' 

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../utilities/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  // FieldPath,
  onSnapshot,
} from 'firebase/firestore'
import axios from 'axios'

import AttendanceModal from '../components/AttendanceModal'
import FormConfirmationModal from '../components/AttendanceFormConfirmation'
import AttendanceToggle from '../components/Toggle'

// import {
//   getEventDetailsFromGoogleCalendar,
//   capitalizeName,
// } from '../utils/attendance_utils'

const AttendanceForm = ({members,eventDetails}) => {
  console.log(eventDetails)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDOB] = useState('')
  const [gender, setGender] = useState('Male')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [invitedBy, setInvitedBy] = useState('')
  const [status, setStatus] = useState('')
  const [first, setFirst] = useState('yes')
  const [classification, setClassification] = useState('')
  const [showQRCode, setShowQRCode] = useState(false)
  const [uniqueCode, setUniqueCode] = useState('')

  const [dummyData, setDummyData] = useState([])

  const [matchedNames, setMatchedNames] = useState([])
  const [matchedInviter, setMatchedInviter] = useState([])
  const [selectedName, setSelectedName] = useState(null)

  // State when Present button is submitted - For those who are in the database
  const [isPresentButtonClicked, setIsPresentButtonClicked] = useState(false)
  // State when form is confirmed
  const [isConfirmed, setIsConfirmed] = useState(false)

  // New state variable to track whether attendance is already captured for today's event
  const [isAttendanceCaptured, setIsAttendanceCaptured] = useState(false)

  // Modals
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const handleConfirmationModalConfirm = async () => {
    // Handle the form submission here after the user confirms the information
    setShowConfirmationModal(false)
    setIsConfirmed(true)
    // Convert the data to JSON format using the new function
    const jsonData = convertToJSON(firstName, lastName)

    const generatedCode = uuidv4()
    setUniqueCode(generatedCode)
    setShowQRCode(true)

    // Prepare the data to be saved in the database
    const newData = {
      no: getMaxNoValue() + 1,
      parent_no: null,
      //   lastname: capitalizeName(lastName),
      //   firstname: capitalizeName(firstName),
      lastname: lastName,
      firstname: firstName,
      middlename: null,
      suffix: null,
      nickname: null,
      gender: gender,
      birthdate: new Date(dob),
      street: address,
      brgy: null,
      city: null,
      province: null,
      region: null,
      civilstatus: status,
      bloodtype: null,
      weddingdate: null,
      contact: contact,
      emailadd: null,
      fathersname: null,
      mothersname: null,
      profession_course: null,
      company_school: null,
      cwryear: null,
      entry: null,
      sdg_class: classification,
      status: null,
      pl: null,
      service_role: null,
      ligaya: null,
      chrurch: null,
      lat: null,
      long: null,
      qrCode: jsonData,
      insert_date: new Date(),
      insert_by: 'Reg Team',
      update_date: null,
      update_by: null,
      invitedBy: invitedBy,
    }

    // Add the data to the "master_data" collection in the database

    const docRef = await addDoc(collection(db, 'master_data'), newData)

    console.log('Document written with ID: ', docRef.id)

    // Update the newData object with the doc_id
    newData.doc_id = docRef.id

    // Add the attendance record when the "Present" button is clicked
    addAttendanceRecord(
      eventDetails,
      newData.doc_id,
      newData.no,
      newData.firstname,
      newData.lastname,
      newData.pl,
      newData.invitedBy,
      newData.sdg_class,
      first,
    )

    // Update the "master_data" collection with the doc_id property
    await updateDoc(docRef, { doc_id: docRef.id })
  }

  const handleConfirmationModalClose = () => {
    // Hide the confirmation modal when the user clicks on "Edit"
    setShowConfirmationModal(false)
  }
  

  // Function to add a new attendance record to the "attendance" collection
  const addAttendanceRecord = async (
    event,
    id,
    no,
    firstName,
    lastName,
    pl,
    invitedBy,
    sdg_class,
    first,
    setIsPresentButtonClicked,
  ) => {
    const newAttendanceRecord = {
      date: event ? new Date(event.start) : new Date(), // Replace with the actual event date from Google Calendar
      event: event.event, // Replace with the actual event name from Google Calendar
      id: id,
      no: no,
      firstname: firstName,
      lastname: lastName,
      // firstname: capitalizeName(firstName),
      // lastname: capitalizeName(lastName),
      pastoral_leader: pl,
      invitedBy: invitedBy,
      sdg_class: sdg_class,
      first_timer: first,
    }

    try {
      const docRef = await addDoc(
        collection(db, 'master_data', id, 'attendance'),
        newAttendanceRecord,
      )
      console.log('Attendance record added with ID: ', docRef.id)
      setIsPresentButtonClicked(true)
    } catch (error) {
      console.error('Error adding attendance record: ', error)
    }
  }

  useEffect(() => {
    // Check if attendance is already captured for todays event
    if (selectedName && eventDetails && eventDetails.start) {
      const eventDateTime = new Date(eventDetails.start)

      const attendanceQuery = query(
        collection(db, 'master_data', selectedName.doc_id, 'attendance'),
        where('no', '==', selectedName.no),
        where('date', '==', eventDateTime),
      )

      getDocs(attendanceQuery)
        .then((querySnapshot) => {
          setIsAttendanceCaptured(!querySnapshot.empty)
        })
        .catch((error) => {
          console.error('Error checking attendance: ', error)
        })
    }
  }, [eventDetails, selectedName])

  const handlePresentButtonClick = () => {
    // Add the attendance record when the "Present" button is clicked
    addAttendanceRecord(
      eventDetails,
      selectedName.doc_id,
      selectedName.no,
      selectedName.firstname,
      selectedName.lastname,
      selectedName.pl,
      null,
      selectedName.sdg_class,
      'no',
    )
  }

  

  // Function to get the maximum "no" value from the "members" array
  const getMaxNoValue = () => {
    const maxNo = members.reduce((max, member) => {
      return member.no > max ? member.no : max
    }, 0)
    return maxNo
  }

  // New function to convert data to JSON format
  const convertToJSON = (firstName, lastName) => {
    return JSON.stringify({
      firstname: firstName,
      lastname: lastName,
    })
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    setShowConfirmationModal(true)
  }

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value)
    setSelectedName(null)
    setMatchedNames([])
  }

  const handleLastNameChange = (e) => {
    const inputLastName = e.target.value
    setLastName(inputLastName)

    setSelectedName(null)

    if (inputLastName.trim() === '') {
      setMatchedNames([]) // Clear the matched names list if the input is empty
      setFirstName('')
    } else {
      const matched = members.filter((record) =>
        record.lastname.toLowerCase().includes(inputLastName.toLowerCase()),
      )
      setMatchedNames(
        matched.map((record) => `${record.lastname}, ${record.firstname}`),
      )
      setSelectedName(null)
    }
  }

  const handleInvitedByChange = (e) => {
    const inputInvitedBy = e.target.value
    setInvitedBy(inputInvitedBy)

    if (inputInvitedBy.trim() === '') {
      setMatchedInviter([]) // Clear the matched names list if the input is empty
    } else {
      const matched = members.filter((record) =>
        record.firstname.toLowerCase().includes(inputInvitedBy.toLowerCase()),
      )
      setMatchedInviter(
        matched.map((record) => `${record.firstname} ${record.lastname}`),
      )
    }
  }

  const handleSelectInviter = (selectedInviter) => {
    setInvitedBy(selectedInviter)
    setMatchedInviter([]) // Clear the matched names list after selection
  }

  const handleMatchedNameClick = (selectedName) => {
    // console.log(selectedName)
    const matchedRecord = members.find((record) => {
      const fullName = `${record.lastname}, ${record.firstname}`.toLowerCase()
      return fullName === selectedName.toLowerCase()
    })

    // console.log(matchedRecord);

    if (matchedRecord) {
      setFirstName(matchedRecord.firstname)
      setLastName(matchedRecord.lastname)
      setMatchedNames([])
      setSelectedName(matchedRecord)
      setShowQRCode(true)
    }
  }

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setDOB('')
    setGender('')
    setContact('')
    setAddress('')
    setInvitedBy('')
    setStatus('')
    setFirst('')
    setClassification('')
    setSelectedName(null)
    setShowQRCode(false)
    setUniqueCode('')
    setIsConfirmed(false)
  }
  // console.log(members)
  return (
    // <div className="flex h-screen items-center justify-center">
    <>
      {/* <div className='mb-5'>
      <AttendanceToggle/>
      </div> */}
      {/* <div className="w-full max-w-md justify-center"> */}
      <div>
        <form
          onSubmit={handleSubmit}
          className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md"
        >
          <div className="mb-4">
            <input
              className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
              id="lastName"
              type="text"
              placeholder="Surname"
              value={lastName}
              onChange={handleLastNameChange}
              required
              autoComplete="off"
            />
            {/* Show Matched names */}
            {lastName.trim().length >= 3 && matchedNames.length > 0 && (
              <ul className="mt-2 rounded-md border border-gray-300 bg-gray-100 p-2">
                {matchedNames.map((matchedName, index) => (
                  <li
                    key={index}
                    className="flex cursor-pointer items-center justify-between py-1 hover:bg-gray-200"
                    onClick={() => handleMatchedNameClick(matchedName)}
                  >
                    <span>{matchedName}</span>
                    <span className="text-xs italic text-red-500">matched</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedName ? (
            <>
              <div className="mb-4 flex flex-col">
                <p>
                  <span className="font-bold">Name:</span>{' '}
                  <span className="font-italic">
                    {`${selectedName.firstname} ${selectedName.lastname}`}
                  </span>
                </p>
                <p>
                  <span className="font-bold">Pastoral Leader:</span>{' '}
                  <span className="font-italic">
                    {selectedName.pl ? selectedName.pl : 'N/A'}
                  </span>
                </p>
                <p>
                  <span className="font-bold">Today&apos;s Event:</span>{' '}
                  <span className="font-italic">
                    {eventDetails ? eventDetails[0].event : 'No event for today'}
                  </span>
                </p>
                <p>
                  <span className="font-bold">Date:</span>{' '}
                  <span className="font-italic">
                    {eventDetails
                      ? new Date(
                          eventDetails[0].start
                        ).toLocaleDateString()
                      : 'No event for today'}
                  </span>
                </p>
              </div>
              {/* Conditionally render the "Present" button */}
              {eventDetails && !isAttendanceCaptured && (
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    onClick={handlePresentButtonClick}
                  >
                    I&apos;m Here!
                  </button>
                </div>
              )}

              {/* Render attendance message when attendance is already captured */}
              {isAttendanceCaptured && eventDetails && eventDetails.event && (
                <div className="mt-4 rounded-lg border border-red-100 bg-white p-4 text-center shadow-lg">
                  <p className="font-blue-100 font-italic text-xl">
                    We have already recorded your attendance for today&apos;s event!
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4">
                <input
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  id="firstName"
                  type="text"
                  placeholder="Name"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="mb-4">
                <select
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  autoComplete="off"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="mb-2 block text-sm font-bold text-gray-700"
                  htmlFor="dob"
                >
                  Date of Birth
                </label>
                <input
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  id="dob"
                  type="date"
                  placeholder="Date of Birth"
                  value={dob}
                  onChange={(e) => setDOB(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="radio"
                      className="form-radio text-blue-500"
                      name="gender"
                      value="Male"
                      checked={gender === 'Male'}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    />
                    <span className="text-gray-700">Male</span>
                  </label>
                  <label className="flex cursor-pointer items-center space-x-2">
                    <input
                      type="radio"
                      className="form-radio text-pink-500"
                      name="gender"
                      value="Female"
                      checked={gender === 'Female'}
                      onChange={(e) => setGender(e.target.value)}
                      required
                    />
                    <span className="text-gray-700">Female</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <input
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  id="contact"
                  type="text"
                  placeholder="Contact No."
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="mb-4">
                <input
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  id="address"
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>

              <div className="mb-4">
                <input
                  className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                  id="invitedBy"
                  type="text"
                  placeholder="Invited By"
                  value={invitedBy}
                  onChange={handleInvitedByChange}
                  required
                  autoComplete="off"
                />
                {matchedInviter.length > 0 && invitedBy.trim() !== '' && (
                  <ul className="mt-2 rounded-md border border-gray-300 bg-gray-100 p-2">
                    {matchedInviter.map((matchedName, index) => (
                      <li
                        key={index}
                        className="flex cursor-pointer items-center justify-between py-1 hover:bg-gray-200"
                        onClick={() => handleSelectInviter(matchedName)}
                      >
                        <span>{matchedName}</span>
                        <span className="text-xs italic text-red-500">
                          matched
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <label
                className="mb-2 block text-sm font-bold text-gray-700"
                htmlFor="dob"
              >
                Is this your first time to attend?{' '}
              </label>
              <div className="mb-2 flex items-center space-x-4">
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    className="form-radio text-blue-500"
                    name="first"
                    value="no"
                    checked={first === 'no'}
                    onChange={(e) => setFirst(e.target.value)}
                    required
                  />
                  <span className="text-gray-700">No</span>
                </label>
                <label className="flex cursor-pointer items-center space-x-2">
                  <input
                    type="radio"
                    className="form-radio text-pink-500"
                    name="first"
                    value="yes"
                    checked={first === 'yes'}
                    onChange={(e) => setFirst(e.target.value)}
                    required
                  />
                  <span className="text-gray-700">Yes</span>
                </label>
              </div>
              <div className="mb-8 rounded-lg border border-green-500 p-4">
                <div className="mb-4">
                  {/* <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="classification"
                  >
                    Classification
                  </label> */}
                  <select
                    className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    id="classification"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    required
                  >
                    <option value="">Select Classification</option>
                    <option value="LNP Member SDG">LNP Member SDG</option>
                    <option value="LNP Member SDG - Family">
                      LNP Member SDG - Family
                    </option>
                    <option value="LNP Member Non-SDG">
                      LNP Member Non-SDG
                    </option>
                    <option value="Non-LNP-Guest">Non-LNP-Guest</option>
                  </select>
                </div>
                <p className="text-sm italic text-gray-600">
                  This section should be filled by the registration team.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </form>
        {/* Render the confirmation modal when showConfirmationModal is true */}
        {showConfirmationModal && (
          <FormConfirmationModal
            data={{
              firstname: firstName,
              lastname: lastName,
              birthdate: dob,
              civilstatus: status,
              address: address,
              gender: gender,
              invitedBy: invitedBy,
              contact: contact,
              first: first,
              // Add more fields as needed
            }}
            onClose={handleConfirmationModalClose}
            onConfirm={handleConfirmationModalConfirm}
          />
        )}
        {/* Render the modal when isSubmitted is true or isPresentButtonClicked is true */}
        {(isConfirmed || isPresentButtonClicked) && (
          <AttendanceModal
            onClose={() => {
              setIsPresentButtonClicked(false) // Reset isPresentButtonClicked to false when modal is closed
              setIsConfirmed(false)
              resetForm()
            }}
            eventSummary={eventDetails ? eventDetails[0].event : ''}
            name={selectedName ? selectedName.firstname : ''}
            // eventSummary={eventDetails ? eventDetails.summary : ""}
          />
        )}
      </div>
    </>
  )
}

export default AttendanceForm
