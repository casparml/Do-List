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
    <button class="delete-button">
        <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
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
    const todoTextLabel = todoLI.querySelector(".todo-text");
    todoTextLabel.addEventListener("click", (e) => {
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