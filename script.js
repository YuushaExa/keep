// Initialize Dexie
const db = new Dexie('SimpleKeepDB');
db.version(1).stores({
    notes: '++id,text,category'
});

// Function to add or update a note
const addOrUpdateNote = async (id = null) => {
    const noteText = document.getElementById('note-text').value;
    const noteCategory = document.getElementById('note-category').value;
    if (noteText.trim() !== '') {
        if (id) {
            await db.notes.update(id, { text: noteText, category: noteCategory });
        } else {
            await db.notes.add({ text: noteText, category: noteCategory });
        }
        document.getElementById('note-text').value = '';
        document.getElementById('note-category').value = '';
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
            <div class="note-content">${note.text}</div>
            <div class="note-category">${note.category}</div>
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
    document.getElementById('note-text').value = note.text;
    document.getElementById('note-category').value = note.category;
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
