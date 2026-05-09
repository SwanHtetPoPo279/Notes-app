// elements
const popup = document.querySelector("#notePopup");
const newNoteBtn = document.querySelector(".new-note-btn");
const cancelBtn = document.querySelector(".cancelBtn");
const saveBtn = document.querySelector(".saveBtn");

const titleInput = document.querySelector("#noteTitle");
const contentInput = document.querySelector("#noteContent");
const categoryInput = document.querySelector("#noteCategory");

const searchInput = document.querySelector(".searchnote");
const filterCategory = document.querySelector("#filterCategory");
const sortSelect = document.querySelector("#sortNotes");

const container = document.querySelector(".shownotegroup");
const emptyDiv = document.querySelector(".ifnonote");
const trashBtn = document.querySelector(".trashBtn");

// data
let notes = JSON.parse(localStorage.getItem("notes")) || [];

let isEdit = false;
let editId = null;
let showTrash = false;

let currentCategory = "all";
let currentSort = "newest";
let searchKeyword = "";

// open popup
newNoteBtn.onclick = () => {
    popup.classList.remove("hidden");
};

// close popup
cancelBtn.onclick = closePopup;

function closePopup() {
    popup.classList.add("hidden");
    titleInput.value = "";
    contentInput.value = "";
    categoryInput.value = "personal";
    isEdit = false;
    editId = null;
}

// save note
saveBtn.onclick = () => {

    if (!titleInput.value.trim() && !contentInput.value.trim()) {
        alert("Empty note!");
        return;
    }

    if (isEdit) {

        const note = notes.find(n => n.id === editId);

        if (note) {
            note.title = titleInput.value;
            note.content = contentInput.value;
            note.category = categoryInput.value;
        }

    } else {

        notes.push({
            id: crypto.randomUUID(),
            title: titleInput.value,
            content: contentInput.value,
            category: categoryInput.value,
            pinned: false,
            trashed: false,
            date: new Date().toISOString()
        });
    }

    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
    closePopup();
};

// process notes
function getNotes() {

    let result = [...notes];
    
    if (showTrash) {
            result = result.filter(n => n.trashed);
    } else {
            result = result.filter(n => !n.trashed);
    }

    // search
    if (searchKeyword) {
        result = result.filter(n =>
            n.title.toLowerCase().includes(searchKeyword) ||
            n.content.toLowerCase().includes(searchKeyword)
        );
    }

    // category filter
    if (currentCategory !== "all") {
        result = result.filter(n => n.category === currentCategory);
    }

    // sort
    if (currentSort === "newest") {
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (currentSort === "oldest") {
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
        result.sort((a, b) => a.title.localeCompare(b.title));
    }

    // pinned first
    result.sort((a, b) => b.pinned - a.pinned);

    return result;
}

// render notes
function renderNotes() {

    const list = getNotes();

    container.innerHTML = "";
    emptyDiv.innerHTML = "";

    if (list.length === 0) {
        emptyDiv.innerHTML = "<h4>No notes found</h4>";
        return;
    }

    list.forEach(note => {

        const card = document.createElement("div");
        card.className = "note-card";

        const header = document.createElement("div");
        header.className = "note-header";

        const title = document.createElement("h5");
        title.textContent = note.title;

        const btnGroup = document.createElement("div");

        // PIN BUTTON
        const pinBtn = document.createElement("button");
        pinBtn.className = "icon-btn";

        function updatePin() {
            pinBtn.innerHTML = note.pinned
                ? '<i class="bi bi-pin-fill"></i>'
                : '<i class="bi bi-pin"></i>';
        }

        updatePin();

        pinBtn.onclick = () => {
            note.pinned = !note.pinned;
            updatePin();

            localStorage.setItem("notes", JSON.stringify(notes));
            renderNotes();
        };

        // EDIT BUTTON
        const editBtn = document.createElement("button");
        editBtn.className = "icon-btn";
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';

        editBtn.onclick = () => {
            popup.classList.remove("hidden");

            titleInput.value = note.title;
            contentInput.value = note.content;
            categoryInput.value = note.category;

            isEdit = true;
            editId = note.id;
        };

        if (showTrash) {

                const restoreBtn = document.createElement("button");
                restoreBtn.className = "icon-btn";
                restoreBtn.innerHTML =
                    '<i class="bi bi-arrow-counterclockwise"></i>';

                restoreBtn.onclick = () => {
                    note.trashed = false;
                    localStorage.setItem("notes", JSON.stringify(notes));
                    renderNotes();
                };
                btnGroup.appendChild(restoreBtn);
            }

        // DELETE BUTTON
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "icon-btn";
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';

        deleteBtn.onclick = () => {

            // normal mode
                if (!showTrash) {
                    if (!confirm(`Move "${note.title}" to trash?`)) return;
                    note.trashed = true;
                }

                // trash mode
                else {
                    if (!confirm(`Delete "${note.title}" forever?`)) return;
                    notes = notes.filter(n => n.id !== note.id);
                }

                localStorage.setItem("notes", JSON.stringify(notes));
                renderNotes();
            };

        if (!showTrash) {
            btnGroup.append(pinBtn, editBtn, deleteBtn);
        } else {
            btnGroup.append(deleteBtn);
        }

        header.append(title, btnGroup);

        const content = document.createElement("p");
        content.textContent = note.content;

        const category = document.createElement("small");
        category.textContent = note.category;
        category.className = "note-category";

        const date = document.createElement("small");
        date.textContent = new Date(note.date).toLocaleString();

        card.append(header, content, category, document.createElement("br"), date);
        container.appendChild(card);
    });
}

// search
searchInput.oninput = () => {
    searchKeyword = searchInput.value.toLowerCase();
    renderNotes();
};

// filter
filterCategory.onchange = () => {
    currentCategory = filterCategory.value;
    renderNotes();
};

// sort
sortSelect.onchange = () => {
    currentSort = sortSelect.value;
    renderNotes();
};

trashBtn.onclick = () => {

    showTrash = !showTrash;

    renderNotes();
};

// theme
const themeToggle = document.querySelector("#themeToggle");
const icon = themeToggle.querySelector("i");

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    icon.classList.replace("bi-sun-fill", "bi-moon-fill");
}

themeToggle.onclick = () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        icon.classList.replace("bi-sun-fill", "bi-moon-fill");
        localStorage.setItem("theme", "dark");
    } else {
        icon.classList.replace("bi-moon-fill", "bi-sun-fill");
        localStorage.setItem("theme", "light");
    }

    renderNotes();
};

// init
renderNotes();