// Initialize Dexie
const db = new Dexie('SimpleKeepDB');
db.version(1).stores({
    notes: '++id,title,text,folder',
    folders: '++id,name,parentId'
});

// Function to add or update a note
const addOrUpdateNote = async (id = null) => {
    const noteText = document.getElementById('note-text').value;
    const noteTitle = document.getElementById('note-title').value || noteText.substring(0, 10) || 'Untitled';
    const noteFolder = document.getElementById('note-folder').value;

    if (noteText.trim() !== '') {
        if (id) {
            await db.notes.update(id, { title: noteTitle, text: noteText, folder: noteFolder });
        } else {
            await db.notes.add({ title: noteTitle, text: noteText, folder: noteFolder });
        }
        document.getElementById('note-title').value = '';
        document.getElementById('note-text').value = '';
        loadNotes(noteFolder);
    }
};

// Function to add a new folder
const addFolder = async () => {
    const folderName = document.getElementById('new-folder-name').value.trim();
    if (folderName) {
        await db.folders.add({ name: folderName, parentId: null });
        document.getElementById('new-folder-name').value = '';
        loadFolders();
    }
};

// Function to delete a folder
const deleteFolder = async () => {
    const folderName = document.getElementById('note-folder').value;
    if (folderName && folderName !== 'Notes') {
        await db.folders.where('name').equals(folderName).delete();
        await db.notes.where('folder').equals(folderName).delete();
        loadFolders();
        loadNotes();
    } else {
        alert('Cannot delete the default "Notes" folder.');
    }
};

// Function to load folders and notes
const loadFolders = async () => {
    const folders = await db.folders.toArray();
    const foldersContainer = document.getElementById('folders-container');
    const noteFolderSelect = document.getElementById('note-folder');
    foldersContainer.innerHTML = '';
    noteFolderSelect.innerHTML = '<option value="Notes">Notes</option>';

    folders.forEach(folder => {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        folderDiv.innerText = folder.name;
        folderDiv.onclick = () => loadNotes(folder.name);
        foldersContainer.appendChild(folderDiv);

        const folderOption = document.createElement('option');
        folderOption.value = folder.name;
        folderOption.innerText = folder.name;
        noteFolderSelect.appendChild(folderOption);
    });
};

const loadNotes = async (folder = 'Notes') => {
    const notes = await db.notes.where('folder').equals(folder).toArray();
    const notesContainer = document.getElementById('notes-container');
    notesContainer.innerHTML = '';

    notes.forEach(note => {
        const noteTitleDiv = document.createElement('div');
        noteTitleDiv.className = 'note-title';
        noteTitleDiv.innerText = note.title;
        noteTitleDiv.onclick = () => loadNoteText(note.id);
        notesContainer.appendChild(noteTitleDiv);
    });
};

// Event listener for the add note button
document.getElementById('add-note').addEventListener('click', () => addOrUpdateNote());
document.getElementById('add-folder').addEventListener('click', addFolder);
document.getElementById('delete-folder').addEventListener('click', deleteFolder);

// Load folders and notes on page load
window.onload = async () => {
    await loadFolders();
    await loadNotes();
};

const updateCharCount = () => {
    const text = document.getElementById('note-text').value;
    const charCount = text.length;
    document.getElementById('char-count').innerText = charCount;
};

const loadNoteText = async (id) => {
    const note = await db.notes.get(id);
    if (note) {
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-text').value = note.text;
        document.getElementById('note-folder').value = note.folder;
        updateCharCount();
    } else {
        alert('Note not found.');
    }
};

// Event listener for input and paste in the note text area
document.getElementById('note-text').addEventListener('input', updateCharCount);
document.getElementById('note-text').addEventListener('paste', updateCharCount);
