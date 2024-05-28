// Initialize Dexie
const db = new Dexie('SimpleKeepDB');

// Set the database schema and version
db.version(2).stores({
    notes: '++id,title,text,folder',
    folders: '++id,name,parentId'
}).upgrade(async tx => {
    // Add a default folder to existing notes if they don't have one
    await tx.notes.toCollection().modify(note => {
        if (!note.folder) {
            note.folder = 'Notes';
        }
    });

    // Add default folders if they don't exist
    const folders = await tx.folders.toArray();
    const defaultFolders = ['Notes', 'Trash'];
    defaultFolders.forEach(async folderName => {
        if (!folders.some(folder => folder.name === folderName)) {
            await tx.folders.add({ name: folderName, parentId: null });
        }
    });
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

// Function to delete (move to Trash) a folder
const deleteFolder = async () => {
    const folderName = document.getElementById('note-folder').value;
    if (folderName && folderName !== 'Notes' && folderName !== 'Trash') {
        const confirmation = confirm(`Are you sure you want to delete the folder "${folderName}" and move all its notes to the Trash?`);
        if (confirmation) {
            const notesToTrash = await db.notes.where('folder').equals(folderName).toArray();
            await db.transaction('rw', db.notes, db.folders, async () => {
                for (const note of notesToTrash) {
                    await db.notes.update(note.id, { folder: 'Trash' });
                }
                await db.folders.where('name').equals(folderName).delete();
            });
            loadFolders();
            loadNotes();
        }
    } else {
        alert('Cannot delete the default "Notes" or "Trash" folder.');
    }
};

// Function to load folders and notes
const loadFolders = async () => {
    const folders = await db.folders.toArray();
    const foldersContainer = document.getElementById('folders-container');
    const noteFolderSelect = document.getElementById('note-folder');
    foldersContainer.innerHTML = '';
    noteFolderSelect.innerHTML = '';

    // Add the default "Notes" and "Trash" folders manually
    const defaultFolders = ['Notes', 'Trash'];
    defaultFolders.forEach(folderName => {
        const folderDiv = document.createElement('div');
        folderDiv.className = 'folder';
        folderDiv.innerText = folderName;
        folderDiv.onclick = () => loadNotes(folderName);
        foldersContainer.appendChild(folderDiv);

        const folderOption = document.createElement('option');
        folderOption.value = folderName;
        folderOption.innerText = folderName;
        noteFolderSelect.appendChild(folderOption);
    });

    // Add the folders from the database
    folders.forEach(folder => {
        if (!defaultFolders.includes(folder.name)) {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'folder';
            folderDiv.innerText = folder.name;
            folderDiv.onclick = () => loadNotes(folder.name);
            foldersContainer.appendChild(folderDiv);

            const folderOption = document.createElement('option');
            folderOption.value = folder.name;
            folderOption.innerText = folder.name;
            noteFolderSelect.appendChild(folderOption);
        }
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
