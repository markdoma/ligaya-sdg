'use client' 
import {useEffect,useState} from 'react'
import AttendanceForm from '@/components/AttendanceForm'
import RegistrationForm from '@/components/RegistrationForm'
import AttendanceToggle from '@/components/Toggle'

import { db } from '../../utilities/firebase'
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

export default function Attendance() {

  const [eventDetails, setEventDetails] = useState(null)
  const [members, setMembers] = useState([])


  useEffect(() => {
    // Fetch event details from Google Calendar when the component mounts
    getEventDetailsFromGoogleCalendar()
      .then((event) => {
        console.log('Fetch event date!')
        setEventDetails(event)
        // setEventDetails('October 7, 2023 at 2:00:00 PM UTC+8')
      })
      .catch((error) => {
        console.error('Error fetching event details: ', error)
      })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const membersCollection = collection(db, 'master_data')

      const unsubscribe = onSnapshot(membersCollection, (snapshot) => {
        const fetchedMembers = snapshot.docs.map((doc) => doc.data())
        setMembers(fetchedMembers)
      })

      // Return the cleanup function to unsubscribe when the component unmounts
      return () => unsubscribe()
    }

    fetchData()
  }, [])


  const getEventDetailsFromGoogleCalendar = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/ligayasdg@gmail.com/events`,
        {
          params: {
            // key: 'AIzaSyC0OBwnEO2n244bIYqjhvTkdo1_QaZIjtY',
            key: 'AIzaSyAbX2qOg-8MGiK2HHxpNT0DAwCogdHpJJM',
          },
        },
      )
      // console.log(response.data)
      const currentDate = new Date()

      const data = response.data.items
      console.log(data)
      const eventsForCurrentDay = data.filter((event) => {
        // Check if event has start property and either dateTime or date property
        if (event.start && (event.start.dateTime || event.start.date)) {
          const eventDate =
            new Date(event.start.dateTime) || new Date(event.start.date)
          const summary = event.summary.toLowerCase()
          const status = event.status

          // Check if the event status is 'confirmed'
          const isConfirmed = status === 'confirmed'

          // Return true only if the event date matches the current date,
          // the status is 'confirmed', and the summary matches specific criteria
          return (
            isConfirmed &&
            eventDate.toDateString() === currentDate.toDateString() &&
            (summary.startsWith('sdg: district') ||
              summary.startsWith('open') ||
              summary.startsWith('beyond'))
          )
        }

        // If start or dateTime/date is missing, or status is not 'confirmed', exclude the event
        return false
      })
      console.log(eventsForCurrentDay)

      return eventsForCurrentDay.length > 0 ? eventsForCurrentDay[0] : null
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }


  return (
    <div className="flex flex-col justify-center items-center">
      <div className='mb-5'>
        <AttendanceToggle/>
      </div>
      
      {/* <RegistrationForm/> */}
      <AttendanceForm members={members} eventDetails={eventDetails} />

    </div>
  )
}
