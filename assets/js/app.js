const MAX_FOLDERS = 8; // Maximum number of folders

document.addEventListener('DOMContentLoaded', (event) => {
    const todoForm = document.querySelector('form');
    const todoInput = document.getElementById('todo-input');
    const todoListUL = document.getElementById('todo-list');
    const addFolderButton = document.getElementById('add-folder-button');
    const folderListUL = document.getElementById('folder-list');
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    // Retrieve todos and folders from local storage
    let allTodos = getTodos();
    let allFolders = getFolders();
    let currentFolder = localStorage.getItem('currentFolder');

    // Check if there are no folders and create one if necessary
    if (allFolders.length === 0) {
        addFolder(true); // Pass true to indicate it's the initial load
    } else if (allFolders.length === 1) {
        currentFolder = allFolders[0].name;
    }

    updateTodoList();
    updateFolderList();

    // Add event listener to the form to handle new todoItem submissions
    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTodo();
        toggleSortable();
    });

    // Add event listener to the add folder button to handle new folder submissions
    addFolderButton.addEventListener('click', function(e) {
        e.preventDefault();
        addFolder();
    });

    const sidebarToggleButton = document.getElementById('sidebar-toggle-button');
    const deleteFolderButton = document.getElementById('delete-folder-button');
    const sidebar = document.querySelector('.sidebar');

    sidebarToggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    deleteFolderButton.addEventListener('click', () => {
        if (allFolders.length > 1) {
            if (confirm('Are you sure you want to delete this folder?')) {
                deleteCurrentFolder();
            }
        } else {
            alert('You cannot delete the only folder.');
        }
    });

    // Add a new todoItem
    function addTodo() {
        const todoText = todoInput.value.trim();
        if (todoText.length > 0) {
            const todoObject = {
                text: todoText,
                completed: false,
                folder: currentFolder // Add folder property
            };
            allTodos.push(todoObject);
            updateTodoList();
            saveTodos();
            todoInput.value = "";
        }
    }

    // Open the edit modal
    function openEditModal(todoIndex, todoText) {
        const editModal = document.getElementById('editModal');
        const editInput = document.getElementById('editInput');
        const saveButton = document.getElementById('saveButton');
        const cancelButton = document.getElementById('cancelButton');

        editInput.value = todoText;
        editModal.style.display = 'block';

        // Save changes
        saveButton.onclick = function() {
            const newTodoText = editInput.value.trim();
            if (newTodoText.length > 0) {
                allTodos[todoIndex].text = newTodoText;
                saveTodos();
                updateTodoList();
                editModal.style.display = 'none';
            }
        };

        // Cancel editing
        cancelButton.onclick = function() {
            editModal.style.display = 'none';
        };

        // Close the modal when clicking outside of it
        window.onclick = function(event) {
            if (event.target == editModal) {
                editModal.style.display = 'none';
            }
        };
    }

    // Generate a unique folder name
    function generateUniqueFolderName(baseName = "Folder") {
        let folderIndex = allFolders.length + 1;
        let folderName = `${baseName} ${folderIndex}`;
        while (allFolders.some(folder => folder.name === folderName)) {
            folderIndex++;
            folderName = `${baseName} ${folderIndex}`;
        }
        return folderName;
    }

    // Generate a random color
    function generateRandomColor() {
        return `hsl(${Math.floor(Math.random() * 360)}, 100%, 85%)`;
    }

    // Add a new folder
    function addFolder(isInitialLoad = false, baseName = "Folder") {
        if (allFolders.length >= MAX_FOLDERS) {
            alert(`You cannot add more than ${MAX_FOLDERS} folders.`);
            return;
        }
        const folderName = generateUniqueFolderName(baseName);
        const randomColor = generateRandomColor();
        const folderObject = {
            name: folderName,
            color: randomColor
        };
        allFolders.push(folderObject);
        if (isInitialLoad || allFolders.length === 1) {
            currentFolder = folderName;
        }
        updateFolderList();
        saveFolders();
    }

    // Update the todo list
    function updateTodoList() {
        todoListUL.innerHTML = '';
        allTodos.forEach((todo, index) => {
            if (todo.folder === currentFolder) {
                const todoLI = createTodoItem(todo, index);
                todoListUL.appendChild(todoLI);
            }
        });
    }

    // Save the current folder to localStorage whenever it changes
    function setCurrentFolder(folderName) {
        currentFolder = folderName;
        localStorage.setItem('currentFolder', folderName);
        updateTodoList();
    }

    // Update the folder list
    function updateFolderList() {
        // Remove excess folders if there are more than 8
        if (allFolders.length > 8) {
            allFolders = allFolders.slice(0, 8);
            saveFolders();
        }

        folderListUL.innerHTML = '';
        allFolders.forEach((folder, index) => {
            const folderLI = createFolderItem(folder, index);
            folderListUL.appendChild(folderLI);
        });
    }

    // Save todos to local storage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(allTodos));
    }

    // Save folders to local storage
    function saveFolders() {
        localStorage.setItem('folders', JSON.stringify(allFolders));
    }

    // Get todos from local storage
    function getTodos() {
        const todos = localStorage.getItem('todos');
        return todos ? JSON.parse(todos) : [];
    }

    // Get folders from local storage
    function getFolders() {
        const folders = localStorage.getItem('folders');
        return folders ? JSON.parse(folders) : [];
    }

    // Create a todoItem element
    function createTodoItem(todo, todoIndex) {
        const todoId = `todo-${todoIndex}-${Date.now()}`;
        const todoLI = document.createElement("li");
        const todoText = escapeHtml(todo.text);
        todoLI.className = "todo d-flex align-items-center sortable-item";
        todoLI.dataset.index = todoIndex; // Store the index as a data attribute
        todoLI.innerHTML = `
        <div class="drag-handle mt-2 me-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--secondary-color)" viewBox="0 0 16 16">
                <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
            </svg>
        </div>
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
            </svg>
        </label>
        <span class="todo-text">${todoText}</span>

        <button class="editButton btn btn-link p-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--secondary-color)" class="bi bi-pencil-square" viewBox="0 0 16 16">
                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                 <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
            </svg>
        </button>

        <button class="delete-button btn btn-link p-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--secondary-color)" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5"/>
            </svg>
        </button>
        `;

        const deleteButton = todoLI.querySelector(".delete-button");
        deleteButton.addEventListener("click", () => {
            deleteTodoItem(todoIndex);
        });

        const checkbox = todoLI.querySelector("input");
        checkbox.addEventListener("change", () => {
            allTodos[todoIndex].completed = checkbox.checked;
            saveTodos();
        });

        const editButton = todoLI.querySelector(".editButton");
        editButton.addEventListener("click", (e) => {
            e.stopPropagation();
            openEditModal(todoIndex, todo.text);
        });

        const todoTextLabel = todoLI.querySelector(".todo-text");
        todoTextLabel.addEventListener("click", () => {
            todoLI.classList.toggle("expanded");
        });

        checkbox.checked = todo.completed;
        return todoLI;
    }

    // Create a folderItem element
    function createFolderItem(folder, folderIndex) {
        const folderLI = document.createElement("li");
        folderLI.className = "folder m-3 d-flex align-items-center";
        folderLI.dataset.index = folderIndex; // Store the index as a data attribute

        const folderIcon = folder.name === currentFolder ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${folder.color}" class="bi bi-folder2-open" viewBox="0 0 16 16">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.856 1.546l-.64 5.124A2.5 2.5 0 0 1 12.733 15H3.266a2.5 2.5 0 0 1-2.481-2.19l-.64-5.124A1.5 1.5 0 0 1 1 6.14zM2 6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3H2.5a.5.5 0 0 0-.5.5zm-.367 1a.5.5 0 0 0-.496.562l.64 5.124A1.5 1.5 0 0 0 3.266 14h9.468a1.5 1.5 0 0 0 1.489-1.314l.64-5.124A.5.5 0 0 0 14.367 7z"/>
            </svg>` : `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${folder.color}" class="bi bi-folder2" viewBox="0 0 16 16">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5zM2.5 3a.5.5 0 0 0-.5.5V6h12v-.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.71-.629-2.174-1.154C6.374 3.334 5.82 3 5.264 3zM14 7H2v5.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5z"/>
            </svg>`;

        folderLI.innerHTML = `
        <span class="folder-icon">
            ${folderIcon}
        </span>
        `;

        folderLI.addEventListener("click", (event) => {
            // Ensure the click is on the folderLI element
            if (event.currentTarget !== folderLI) return;

            console.log(`Folder clicked: ${folder.name}, Index: ${folderIndex}`);
            // Close any other open folders
            const openFolders = document.querySelectorAll('.folder.open');
            openFolders.forEach(folder => folder.classList.remove('open'));

            // Set the current folder and mark it as open
            setCurrentFolder(folder.name);
            folderLI.classList.add('open');
            updateFolderList(); // Update folder list to reflect the active folder icon change
        });

        return folderLI;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(string) {
        return String(string).replace(/[&<>"'`=/]/g, function (s) {
            return entityMap[s];
        });
    }

    // Delete a todoItem
    function deleteTodoItem(todoIndex) {
        allTodos.splice(todoIndex, 1);
        saveTodos();
        updateTodoList();
        toggleSortable(); // Ensure sortable is toggled after deletion
    }

    // Function to delete the current folder
    function deleteCurrentFolder() {
        if (currentFolder) {
            allFolders = allFolders.filter(folder => folder.name !== currentFolder);
            if (allFolders.length > 0) {
                currentFolder = allFolders[0].name;
            } else {
                currentFolder = null;
            }
            updateFolderList();
            updateTodoList();
            saveFolders();
            saveTodos();
        }
    }

    // Initialize Sortable.js
    new Sortable(todoListUL, {
        animation: 250,
        handle: '.drag-handle',
        onEnd: function (evt) {
            // Get current folder's todos only
            const currentFolderTodos = allTodos.filter(todo => todo.folder === currentFolder);
            
            // Get moved item and update order
            const movedTodo = currentFolderTodos.splice(evt.oldIndex, 1)[0];
            currentFolderTodos.splice(evt.newIndex, 0, movedTodo);
            
            // Update main todos array
            allTodos = allTodos.filter(todo => todo.folder !== currentFolder)
                .concat(currentFolderTodos);
            
            // Update indices
            Array.from(todoListUL.children).forEach((item, index) => {
                item.dataset.index = index;
            });
    
            // Save and update UI
            saveTodos();
            updateTodoList();
        }
    });

    // Disable sorting if there is only one item
    function toggleSortable() {
        const sortableInstance = Sortable.get(todoListUL);
        if (allTodos.length <= 1) {
            sortableInstance.option("disabled", true);
        } else {
            sortableInstance.option("disabled", false);
        }
    }

    // Call toggleSortable initially and whenever the list is updated
    toggleSortable();
});