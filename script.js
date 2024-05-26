// Initialize Dexie
const db = new Dexie('SimpleKeepDB');
db.version(1).stores({
    notes: '++id,text'
});

// Function to add a note
const addNote = async () => {
    const noteText = document.getElementById('note-text').value;
    if (noteText.trim() !== '') {
        await db.notes.add({ text: noteText });
        document.getElementById('note-text').value = '';
        loadNotes();
    }
};

// Function to load notes from the database
const loadNotes = async () => {
    const notes = await db.notes.toArray();
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';
    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.textContent = note.text;
        notesContainer.appendChild(noteDiv);
    });
};

// Event listener for the add note button
document.getElementById('add-note').addEventListener('click', addNote);

// Load notes on page load
window.onload = loadNotes;
