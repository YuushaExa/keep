// Initialize Dexie
const db = new Dexie('SimpleKeepDB');
db.version(1).stores({
    notes: '++id,title,text,category'
});

// Function to add or update a note
const addOrUpdateNote = async (id = null) => {
    const noteTitle = document.getElementById('note-title').value || 'Default';
    const noteText = document.getElementById('note-text').value;
    
    if (noteText.trim() !== '') {
        if (id) {
            await db.notes.update(id, { title: noteTitle, text: noteText });
        } else {
            await db.notes.add({ title: noteTitle, text: noteText });
        }
        document.getElementById('note-title').value = '';
        document.getElementById('note-text').value = '';
        loadNotes();
    }
};

// Function to load only note titles from the database
const loadNoteTitles = async () => {
    const notes = await db.notes.toArray();
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';
    notes.forEach(note => {
        const noteTitleDiv = document.createElement('div');
        noteTitleDiv.className = 'note-title';
        noteTitleDiv.innerText = note.title;
        noteTitleDiv.onclick = () => loadNoteText(note.title);
        notesContainer.appendChild(noteTitleDiv);
    });
};



// Event listener for the add note button
document.getElementById('add-note').addEventListener('click', () => addOrUpdateNote());

// Load note titles on page load
window.onload = loadNoteTitles;

const loadNoteText = async (title) => {
    const note = await db.notes.where('title').equals(title).first();
    if (note) {
        // Display the note text in the note text area
        const noteTextArea = document.getElementById('note-text');
        noteTextArea.value = note.text;
        // Update character count
        updateCharCount();
    } else {
        // Handle the case when the note is not found
        alert('Note not found.');
    }
};

// Event listener for input and paste in the note text area
document.getElementById('note-text').addEventListener('input', updateCharCount);
document.getElementById('note-text').addEventListener('paste', updateCharCount);
