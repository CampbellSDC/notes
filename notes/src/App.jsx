import React from 'react'
import Editor from './Editor/Editor'
import Sidebar from './Sidebar/Sidebar'
import Split from 'react-split'
import './App.css'
import { addDoc, deleteDoc, doc, onSnapshot, setDoc} from 'firebase/firestore'
import { notesCollection, db } from './firebase'

export default function App() {
  const [notes, setNotes] = React.useState([])
  const [currentNoteId, setCurrentNoteId] = React.useState("")

  const [tempNoteText, setTempNoteText] = React.useState("")

  // * Need to set a new array to sort notes based on timestamps

  const sortedNotes = notes.sort((a,b) => b.updatedAt - a.updatedAt)

  // This will populate the current note based on the id, so I don't have to call a function twice below
  // This will take it from the notes state

  const currentNote = 
  notes.find(note => note.id === currentNoteId) || notes[0]

  React.useEffect(() => {
    if(!currentNoteId){
      setCurrentNoteId(notes[0]?.id)
    }
  }, [notes])

  //* Using the setTempNoteText to change the data of the note instead
  //* of making a request each time data changes

  React.useLayoutEffect(() => {
    if(currentNote){
      setTempNoteText(currentNote.body)
    }
  }, [currentNote])

  React.useEffect(() => {
      const unsubscribe = onSnapshot(notesCollection, function(snapshot){

        // This is where we sync up local notes array with snapshot data
        // snapshot.docs returns an array, and use the data so our app can make sense of it

        const notesArr = snapshot.docs.map(doc => ({

          // The body is the only property we are getting from doc.data, so we get that, and then add the id because all
          // firestore data has it's own unique id 

          ...doc.data(),
          id: doc.id
        }))
        setNotes(notesArr)
      })
      return unsubscribe
  }, [])

  // When creating new data in firebase, you get a promise in return

  async function createNewNote() {
      const newNote = {
          body: "# Type your markdown note's title here",
          createdAt: Date.now(),
          updatedAt: Date.now()
      }
      const newNoteRef = await addDoc(notesCollection, newNote)
      setCurrentNoteId(newNoteRef.id)
  }

  // setDoc returns a promise, so this is made an async function

  async function updateNote(text) {
    const docRef = doc(db, "notes", currentNoteId)
    await setDoc(docRef, { body: text, updatedAt: Date.now() }, { merge: true } ) //this first parameter is what note data is being referenced to change, and the second is the actual change itself
    
    /*  the object {merge: true} will merge this updated note with the original note if it exists and there are
    more properties to the document that is being referenced to be changed*/
  }

 async function deleteNote(noteId) {

  // docRef will be the reference to the single piece of data in the db
      const docRef = doc(db, "notes", noteId)
      await deleteDoc(docRef)
  }

  return (
      <main>
          {
              notes.length > 0
                  ?
                  <Split
                      sizes={[30, 70]}
                      direction="horizontal"
                      className="split"
                  >
                      <Sidebar
                          notes={notes}
                          currentNote={currentNote}
                          setCurrentNoteId={setCurrentNoteId}
                          newNote={createNewNote}
                          deleteNote={deleteNote}
                      />
                      <Editor
                              tempNoteText={tempNoteText}
                              setTempNoteText={setTempNoteText}
                          />
                      
                  </Split>
                  :
                  <div className="no-notes">
                      <h1>You have no notes</h1>
                      <button
                          className="first-note"
                          onClick={createNewNote}
                      >
                          Create one now
              </button>
                  </div>

          }
      </main>
  )
}