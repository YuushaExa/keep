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

// Function to load notes from the database
const loadNotes = async () => {
    const notes = await db.notes.toArray();
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';
    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.innerHTML = `
            <div class="note-title">${note.title}</div>
            <div class="note-content">${note.text}</div>
            <div class="note-buttons">
                <button onclick="editNote(${note.id})">Edit</button>
                <button onclick="deleteNote(${note.id})">Delete</button>
            </div>
        `;
        notesContainer.appendChild(noteDiv);
    });
};

// Function to edit a note
const editNote = async (id) => {
    const note = await db.notes.get(id);
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-text').value = note.text;
    document.getElementById('add-note').onclick = () => addOrUpdateNote(id);
};

// Function to delete a note
const deleteNote = async (id) => {
    await db.notes.delete(id);
    loadNotes();
};

// Event listener for the add note button
document.getElementById('add-note').addEventListener('click', () => addOrUpdateNote());

// Load notes on page load
window.onload = loadNotes;
