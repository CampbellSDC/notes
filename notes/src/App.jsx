import React from 'react'
import Editor from './Editor/Editor'
import Sidebar from './Sidebar/Sidebar'
import Split from 'react-split'
import './App.css'
import { addDoc, onSnapshot} from 'firebase/firestore'
import { notesCollection } from './firebase'

export default function App() {
  const [notes, setNotes] = React.useState([])
  const [currentNoteId, setCurrentNoteId] = React.useState(
       (notes[0]?.id) || "" //Question mark checks to see if a note is there
  )

  // This will populate the current note based on the id, so I don't have to call a function twice below
  // This will take it from the notes state
  const currentNote = 
  notes.find(note => note.id === currentNoteId) || notes[0]

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
          body: "# Type your markdown note's title here"
      }
      const newNoteRef = await addDoc(notesCollection, newNote)
      setCurrentNoteId(newNoteRef.id)
  }

  function updateNote(text) {
      setNotes(oldNotes => {
          const newArray = []
          for (let i = 0; i < oldNotes.length; i++) {
              const oldNote = oldNotes[i]
              if (oldNote.id === currentNoteId) {
                  // Put the most recently-modified note at the top
                  newArray.unshift({ ...oldNote, body: text })
              } else {
                  newArray.push(oldNote)
              }
          }
          return newArray
      })
  }

  function deleteNote(event, noteId) {
      event.stopPropagation()
      setNotes(oldNotes => oldNotes.filter(note => note.id !== noteId))
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
                      {
                          currentNoteId &&
                          notes.length > 0 &&
                          <Editor
                              currentNote={currentNote}
                              updateNote={updateNote}
                          />
                      }
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