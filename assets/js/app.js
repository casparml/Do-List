document.addEventListener('DOMContentLoaded', (event) => {
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

    // Open the edit modal
    function openEditModal(todoIndex, todoText) {
        const modal = document.getElementById('editModal');
        const modalInput = document.getElementById('editInput');
        modalInput.value = todoText;

        const saveButton = document.getElementById('saveButton');
        saveButton.onclick = () => {
            const newText = modalInput.value.trim();
            if (newText) {
                allTodos[todoIndex].text = newText;
                saveTodos();
                updateTodoList();
            }
            modal.style.display = 'none';
        };

        const cancelButton = document.getElementById('cancelButton');
        cancelButton.onclick = () => {
            modal.style.display = 'none';
        };

        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        modal.style.display = 'block';
    }

    // Update the todoList
    function updateTodoList() {
        todoListUL.innerHTML = '';
        allTodos.forEach((todo, index) => {
            const todoLI = createTodoItem(todo, index);
            todoListUL.appendChild(todoLI);
        });
    }

    // Save todos to local storage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(allTodos));
    }

    // Get todos from local storage
    function getTodos() {
        const todos = localStorage.getItem('todos');
        return todos ? JSON.parse(todos) : [];
    }

    // Create a todoItem element
    function createTodoItem(todo, todoIndex) {
        const todoId = "todo-" + todoIndex;
        const todoLI = document.createElement("li");
        const todoText = escapeHtml(todo.text);
        todoLI.className = "todo d-flex align-items-center";
        todoLI.dataset.index = todoIndex; // Store the index as a data attribute
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--secondary-color)" class="bi bi-trash3-fill" viewBox="0 0 16 16">
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

        const todoTextLabel = todoLI.querySelector(".todo-text");
        todoTextLabel.addEventListener("click", () => {
            todoLI.classList.toggle("expanded");
        });

        checkbox.checked = todo.completed;
        return todoLI;
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
    }

    // Initialize Sortable.js
    new Sortable(todoListUL, {
        animation: 150,
        onEnd: function (evt) {
            const itemEl = evt.item;
            const newIndex = evt.newIndex;
            const oldIndex = evt.oldIndex;

            // Update the order of the todos in the array
            const movedTodo = allTodos.splice(oldIndex, 1)[0];
            allTodos.splice(newIndex, 0, movedTodo);

            // Save the updated order
            saveTodos();
            updateTodoList();
        }
    });
});