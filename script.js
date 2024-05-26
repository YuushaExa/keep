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
    }
};

// Function to load note keys from the database
const loadNoteKeys = async () => {
    const noteKeys = await db.notes.toCollection().primaryKeys();
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';
    noteKeys.forEach(key => {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-key';
        noteDiv.textContent = key;
        notesContainer.appendChild(noteDiv);
    });
};

// Event listener for the add note button
document.getElementById('add-note').addEventListener('click', async () => {
    await addOrUpdateNote();
    loadNoteKeys();
});

// Load note keys on page load
window.onload = loadNoteKeys;
