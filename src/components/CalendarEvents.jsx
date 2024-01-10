
import { useCollection } from 'react-firebase-hooks/firestore';
import axios from 'axios';


import { db } from '../utilities/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  // FieldPath,
  onSnapshot,
} from 'firebase/firestore'

const CalendarSync = () => {
  

  const collectionRef = collection(db, 'calendarEvents');
//   const [snapshot, loading, error] = useCollection(collectionRef);

  

  const fetchCalendarEvents = async () => {
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
      

      const data = response.data.items


      const confirmedEvents = data.filter((event) => {
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
                  isConfirmed 
                )
              }
      
              // If start or dateTime/date is missing, or status is not 'confirmed', exclude the event
              return false
            })

            return confirmedEvents
    
    } catch (error) {
        console.error('Error fetching events:', error)
    }
}

const clearCollection = async () => {
    try {
      // Get all documents in the collection
      const docs = await getDocs(collectionRef);

      // Delete each document
      await Promise.all(docs.docs.map(async (doc) => {
        await deleteDoc(doc.ref);
      }));

      console.log('Collection cleared successfully');
    } catch (err) {
      console.error('Error clearing collection:', err);
    }
  };

  const syncEvents = async () => {
    try {
      // Clear existing entries in the collection
      await clearCollection();

      // Fetch new calendar events
      const fetchedEvents = await fetchCalendarEvents();

      console.log(fetchedEvents)

      // Store events in Firebase collection
      await Promise.all(
        fetchedEvents.map(async (event) => {
          const formattedDate = event.start.dateTime
            ? new Date(event.start.dateTime).toISOString()
            : new Date(event.start.date).toISOString();
  
          await addDoc(collectionRef, {
            event: event.summary,
            start: formattedDate,
            // end: event.end,
          });
        })
      );

      console.log('Events synced successfully');
    } catch (err) {
      console.error('Error syncing events:', err);
    }
  };
  return (
    <div>
      <button onClick={syncEvents}>Sync Calendar Events</button>
    
    </div>
  );
};

export default CalendarSync;
