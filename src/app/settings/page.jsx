
'use client'
import AttendanceForm from '@/components/AttendanceForm'
import RegistrationForm from '@/components/RegistrationForm'
import AttendanceToggle from '@/components/Toggle'
import CalendarEvents from '@/components/CalendarEvents'

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

export default function Settings() {

  // const [eventDetails, setEventDetails] = useState(null)
  // const [members, setMembers] = useState([])

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


  return (
    <div className="flex flex-col justify-center items-center">
      <div className='mb-5'>
        
        <CalendarEvents/>
      </div>
      
    

    </div>
  )
}
