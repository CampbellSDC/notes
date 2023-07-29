import React from 'react'
import Editor from './Editor/Editor'
import Sidebar from './Sidebar/Sidebar'
import Split from 'react-split'
import { nanoid } from 'nanoid'
import './App.css'
import { onSnapshot } from 'firebase/firestore'
import { notesCollection } from './firebase'

export default function App() {
  const [notes, setNotes] = React.useState(
      () => JSON.parse(localStorage.getItem("notes")) || []
  )
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
        console.log("things are changing")
      })
      return unsubscribe
  }, [])

  function createNewNote() {
      const newNote = {
          id: nanoid(),
          body: "# Type your markdown note's title here"
      }
      setNotes(prevNotes => [newNote, ...prevNotes])
      setCurrentNoteId(newNote.id)
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