"use client"
import {useEffect,useState} from 'react'
import AttendanceForm from '@/components/AttendanceForm'
import RegistrationForm from '@/components/RegistrationForm'
import AttendanceToggle from '@/components/Toggle'
import CalendarEvents from '@/components/CalendarEvents'


import { useCollectionData } from 'react-firebase-hooks/firestore';

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

async function getDataFromFirestore(){
  const querySnapshot = await getDocs(collection(db,"master_data"))
  const data =[]
  querySnapshot.forEach((doc)=>{
    data.push({id:doc.id,...doc.data()});
  })

  return data
}


export default function Attendance() {

  const [eventDetails, setEventDetails] = useState(null)
  const [members, setMembers] = useState([])

  useEffect(()=>{
    async function fetchData(){
      const data =await getDataFromFirestore()
      setMembers(data)
    }
    fetchData()
  },[])

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const membersCollection = collection(db, 'master_data')

  //     const unsubscribe = onSnapshot(membersCollection, (snapshot) => {
  //       const fetchedMembers = snapshot.docs.map((doc) => doc.data())
  //       setMembers(fetchedMembers)
  //     })

  //     // Return the cleanup function to unsubscribe when the component unmounts
  //     return () => unsubscribe()
  //   }

  //   fetchData()
  // }, [])

  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     const eventsCollection = collection(db, 'calendarEvents');
  
  //     const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
  //       const today = new Date();
  //       const todayFormatted = today.toISOString().split('T')[0];
  //       console.log(`today - ${todayFormatted}`)
  
  //       const fetchedEvents = snapshot.docs
  //         .map((doc) => doc.data())
  //         .filter((event) => {
  //           // Assuming that the event has a 'date' property in string format
  //           const eventDate = new Date(event.start);
  
  //           // Convert the event date to string in the same format as todayFormatted
  //           const eventDateFormatted = eventDate.toISOString().split('T')[0];
  
  //           // Compare the event date with today's date
  //           return eventDateFormatted === todayFormatted;
  //         });
  // console.log(fetchedEvents)
  //       if (fetchedEvents.length === 0) {
  //         // If no events today, return null or handle it accordingly
  //         setEventDetails(null);
  //       } else {
  //         setEventDetails(fetchedEvents);
  //       }
  //     });
  
  //     // Return the cleanup function to unsubscribe when the component unmounts
  //     return () => unsubscribe();
  //   };
  
  //   fetchEvents();
  // }, []);
  

  return (
    <div className="flex flex-col justify-center items-center">
      <div className='mb-5'>
        <AttendanceToggle/>
        {/* <CalendarEvents/> */}
      </div>
      
      {/* <RegistrationForm/> */}
      {/* <AttendanceForm members={members} /> */}
      <AttendanceForm members={members} eventDetails={eventDetails} />

    </div>
  )
}
