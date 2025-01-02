const todoForm = document.querySelector('form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');
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

// Retrieve todos from local storage
let allTodos = getTodos();
updateTodoList();

// Add event listener to the form to handle new todoItem submissions
todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addTodo();
});

// Add a new todoItem
function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText.length > 0) {
        const todoObject = {
            text: todoText,
            completed: false
        };
        allTodos.push(todoObject);
        updateTodoList();
        saveTodos();
        todoInput.value = "";
    }
}

function createTodoItem(todo, todoIndex) {
    const todoId = "todo-" + todoIndex;
    const todoLI = document.createElement("li");
    const todoText = escapeHtml(todo.text);
    todoLI.className = "todo d-flex align-items-center";
    todoLI.innerHTML = `
    <input type="checkbox" id="${todoId}">
    <label class="custom-checkbox" for="${todoId}">
        <svg fill="transparent" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
        </svg>
    </label>
    <label class="todo-text">
        ${todoText}
    </label>

    <button class="editButton btn btn-link p-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--secondary-color)" class="bi bi-pencil-square" viewBox="0 0 16 16">
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
             <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
        </svg>
    </button>

    <button class="delete-button btn btn-link p-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="var(--secondary-color)" class="bi bi-trash3-fill" viewBox="0 0 16 16">
            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
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
    checkbox.checked = todo.completed;
    return todoLI;
}

// Open the edit modal
function openEditModal(todoIndex, currentText) {
    const modal = document.getElementById("editModal");
    const editInput = document.getElementById("editInput");
    const saveButton = document.getElementById("saveButton");
    const cancelButton = document.getElementById("cancelButton");

    editInput.value = currentText;
    modal.style.display = "block";

    const saveChanges = () => {
        const newText = editInput.value;
        if (newText !== null) {
            editTodoItem(todoIndex, newText);
            modal.style.display = "none";
            editInput.removeEventListener("keydown", handleKeyDown);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            saveChanges();
        }
    };

    saveButton.onclick = saveChanges;

    editInput.addEventListener("keydown", handleKeyDown);

    cancelButton.onclick = () => {
        modal.style.display = "none";
        editInput.removeEventListener("keydown", handleKeyDown);
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
            editInput.removeEventListener("keydown", handleKeyDown);
        }
    };
}

// Add event listener to the edit button to open the edit modal
todoListUL.addEventListener('click', (e) => {
    if (e.target.classList.contains('editButton')) {
        const todoLI = e.target.closest('li');
        const todoIndex = Array.from(todoListUL.children).indexOf(todoLI);
        const currentText = allTodos[todoIndex].text;
        openEditModal(todoIndex, currentText);
    }
});

// Edit an existing todoItem
function editTodoItem(todoIndex, newText) {
    const sanitizedText = escapeHtml(newText.trim());
    if (sanitizedText.length > 0) {
        allTodos[todoIndex].text = sanitizedText;
        saveTodos();
        updateTodoList();
    }
}

// Delete a todoItem
function deleteTodoItem(todoIndex) {
    allTodos = allTodos.filter((_, i) => i !== todoIndex);
    saveTodos();
    updateTodoList();
}

// Save todos to local storage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(allTodos));
}

// Retrieve todos from local storage
function getTodos() {
    const todos = localStorage.getItem('todos');
    return todos ? JSON.parse(todos) : [];
}

// Update the todoList in the DOM
function updateTodoList() {
    todoListUL.innerHTML = '';
    allTodos.forEach((todo, index) => {
        const todoItem = createTodoItem(todo, index);
        todoListUL.appendChild(todoItem);
    });
}

// Escape HTML to prevent XSS attacks
function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=/\\]/g, function (s) {
        return entityMap[s];
    });
}

// Change favicon based on page visibility
window.onload = function() {
    const favicon = document.getElementById('favicon');

    document.addEventListener('visibilitychange', function() {
        const isPageActive = !document.hidden;
        toggleFavicon(isPageActive);
    });

    function toggleFavicon(isPageActive) {
        if (isPageActive) {
            favicon.href = './assets/images/logo.png';
        } else {
            favicon.href = './assets/images/logo-away.png';
        }
    }
};

// Enable sorting of todoItems
todoListUL.addEventListener('dragstart', (e) => {
    if (e.target?.matches('.sortButton')) {
        e.target.closest('li').classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', null); // Required for Firefox

        // Create a clone of the dragging item for the drag preview
        const dragPreview = e.target.closest('li').cloneNode(true);
        dragPreview.style.position = 'absolute';
        dragPreview.style.top = '-9999px';
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 0, 0);
    }
});

todoListUL.addEventListener('dragend', (e) => {
    if (e.target?.matches('.sortButton')) {
        e.target.closest('li').classList.remove('dragging');
        updateTodoOrder();

        // Remove the drag preview element
        const dragPreview = document.querySelector('body > li');
        if (dragPreview) {
            document.body.removeChild(dragPreview);
        }
    }
});

todoListUL.addEventListener('dragover', (e) => {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(todoListUL, e.clientY);
    if (afterElement == null) {
        todoListUL.appendChild(draggingItem);
    } else {
        todoListUL.insertBefore(draggingItem, afterElement);
    }
});

function updateTodoOrder() {
    const updatedTodos = [];
    todoListUL.querySelectorAll('li').forEach((li) => {
        const todoText = li.querySelector('.todo-text').textContent.trim();
        const todo = allTodos.find(todo => todo.text === todoText);
        if (todo) {
            updatedTodos.push(todo);
        }
    });
    allTodos = updatedTodos;
    saveTodos();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}