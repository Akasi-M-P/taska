// ===== Getting HTML elements we'll need =====
// This object stores all the HTML elements we use in our app
const uiElements = {
  // Buttons
  darkModeButton: document.getElementById("mode"), // Button to switch between light/dark modes
  addButton: document.getElementById("add-task"), // Button to add a new task
  deleteAllButton: document.getElementById("clear-all"), // Button to delete all tasks

  // Main elements
  bodyElement: document.body, // The page's body element
  taskAppContainer: document.getElementById("container"), // Main container for the task app

  // Icons
  lightModeIcon: document.getElementById("light"), // Light mode icon
  darkModeIcon: document.getElementById("dark"), // Dark mode icon

  // Form elements
  taskForm: document.getElementById("task-form"), // Form containing the task input
  taskTextInput: document.getElementById("task-input"), // Text input for new tasks

  // Task and search elements
  taskListContainer: document.getElementById("task-list"), // List containing all tasks
  searchBox: document.getElementById("search-task"), // Search input field

  // Modal elements
  taskModal: document.getElementById("staticBackdrop"), // Task modal
  modalHeading: document.getElementById("staticBackdropLabel"), // Modal title element
};

// Variables to keep track of what we're doing
let taskBeingEdited = null; // Keeps track of which task we're editing (if any)
let bootstrapModal = null; // Will hold the modal object once it's created
let taskBeingDragged = null; // Keeps track of which task is being dragged
let tasks = []; // Will store all our tasks

// Local Storage Keys
const TASKS_STORAGE_KEY = "taskManagerTasks";
const DARK_MODE_STORAGE_KEY = "taskManagerDarkMode";

/**
 * Creates a new task item with all its parts
 * @param {string} taskText - The text content of the task
 * @param {number} taskNumber - The number to display for this task
 * @param {string} taskId - The unique ID for this task
 * @returns {HTMLElement} - The complete task element ready to add to the list
 */
function makeNewTaskItem(taskText, taskNumber, taskId) {
  // Step 1: Create the main list item to hold everything
  const taskItem = document.createElement("li");
  taskItem.id = "task";
  taskItem.textContent = taskText; // Add the task description
  taskItem.draggable = true; // Make it possible to drag this task
  taskItem.dataset.taskId = taskId; // Store the task ID in the element

  // Step 2: Add drag-and-drop abilities
  taskItem.addEventListener("dragstart", startDragging);
  taskItem.addEventListener("dragover", whileDragging);
  taskItem.addEventListener("drop", finishDragging);

  // Step 3: Create the number label
  const numberLabel = document.createElement("span");
  numberLabel.id = "number";
  numberLabel.textContent = taskNumber;

  // Step 4: Create the edit button
  const editButton = document.createElement("span");
  editButton.id = "edit";
  editButton.className = "edit-task";

  // Add the edit icon
  const editIcon = document.createElement("i");
  editIcon.className = "fa-solid fa-pen-to-square"; // Pencil icon
  editIcon.id = "edit";
  editButton.appendChild(editIcon);
  editButton.appendChild(document.createTextNode(" edit")); // Add the word "edit"

  // Step 5: Create the delete button
  const deleteButton = document.createElement("span");
  deleteButton.id = "remove-task";

  // Add the delete icon
  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fa-solid fa-trash"; // Trash can icon
  deleteIcon.id = "remove-task";
  deleteButton.appendChild(deleteIcon);

  // Step 6: Put everything together in the right order
  taskItem.insertBefore(numberLabel, taskItem.firstChild); // Add number at the start
  taskItem.appendChild(editButton); // Add edit button
  taskItem.appendChild(deleteButton); // Add delete button

  // Return the finished task item
  return taskItem;
}

/**
 * What to do when a user starts dragging a task
 */
function startDragging(event) {
  taskBeingDragged = event.target; // Remember which task is being dragged
  event.target.classList.add("dragging"); // Make it look different while dragging
}

/**
 * What to do while a task is being dragged over other tasks
 */
function whileDragging(event) {
  event.preventDefault(); // Allow dropping
  const taskList = uiElements.taskListContainer;

  // Figure out where to place the task
  const taskToPlaceAfter = findTaskToPlaceAfter(taskList, event.clientY);

  // Place the dragged task in the right spot
  if (taskToPlaceAfter) {
    taskList.insertBefore(taskBeingDragged, taskToPlaceAfter);
  } else {
    // If we're dragging below all other tasks, put it at the end
    taskList.appendChild(taskBeingDragged);
  }
}

/**
 * What to do when the user drops a task in a new position
 */
function finishDragging(event) {
  event.preventDefault();
  taskBeingDragged.classList.remove("dragging"); // Make it look normal again
  updateAllTaskNumbers(); // Fix the numbers on all tasks

  // Update the order of tasks in our array and save to local storage
  saveTaskOrderToStorage();
}

/**
 * Updates the task order in our array based on the current DOM order
 * and saves to local storage
 */
function saveTaskOrderToStorage() {
  // Get all task elements in their current order
  const taskElements = uiElements.taskListContainer.querySelectorAll("li");

  // Create a new ordered array based on the DOM order
  const newTasksOrder = [];

  taskElements.forEach((taskElement) => {
    const taskId = taskElement.dataset.taskId;
    // Find the task in our tasks array
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      newTasksOrder.push(task);
    }
  });

  // Update our tasks array
  tasks = newTasksOrder;

  // Save to local storage
  saveTasksToStorage();
}

/**
 * Helps figure out where to place a dragged task
 * @param {HTMLElement} taskList - The container holding all tasks
 * @param {number} mouseY - The current Y position of the mouse
 * @returns {HTMLElement|null} - The element to place the dragged task before
 */
function findTaskToPlaceAfter(taskList, mouseY) {
  // Get all task items except the one being dragged
  const otherTasks = [...taskList.querySelectorAll("li:not(.dragging)")];

  // Find the best place to drop based on mouse position
  return otherTasks.reduce(
    (closestTask, currentTask) => {
      const taskBox = currentTask.getBoundingClientRect();
      const middleOfTask = taskBox.top + taskBox.height / 2;
      const distanceFromMiddle = mouseY - middleOfTask;

      // If we're above this task but closer than the previous best match
      if (distanceFromMiddle < 0 && distanceFromMiddle > closestTask.distance) {
        return { distance: distanceFromMiddle, element: currentTask };
      } else {
        return closestTask;
      }
    },
    { distance: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

/**
 * Adds a new task or updates an existing one
 */
function handleAddOrUpdateTask(event) {
  event.preventDefault(); // Stop the page from refreshing

  // Get what the user typed and remove extra spaces
  const taskText = uiElements.taskTextInput.value.trim();

  // Make sure they actually typed something
  if (!taskText) {
    alert("Please add a task");
    return;
  }

  // If we're editing an existing task...
  if (taskBeingEdited) {
    // Get the task ID
    const taskId = taskBeingEdited.dataset.taskId;

    // Find the task in our array
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    // Check if it would create a duplicate (but not with itself)
    if (isDuplicateTaskText(taskText, taskId)) {
      alert("This task already exists!");
      return;
    }

    // Update the task in our array
    if (taskIndex !== -1) {
      tasks[taskIndex].text = taskText;

      // Save to local storage
      saveTasksToStorage();

      // Update the task element text
      updateExistingTaskText(taskBeingEdited, taskText);
    }

    // Reset everything back to normal
    taskBeingEdited.classList.remove("edit-task");
    taskBeingEdited = null;
    uiElements.addButton.textContent = "Add Item";
    uiElements.modalHeading.textContent = "Enter task";
  }
  // If we're adding a brand new task...
  else {
    // Check if it would create a duplicate
    if (isDuplicateTaskText(taskText)) {
      alert("This task already exists!");
      return;
    }

    // Create a new task object with a unique ID
    const newTask = {
      id: Date.now().toString(), // Use timestamp as ID
      text: taskText,
    };

    // Add to our tasks array
    tasks.push(newTask);

    // Save to local storage
    saveTasksToStorage();

    // Create the new task element and add it to the list
    const newTaskElement = makeNewTaskItem(taskText, tasks.length, newTask.id);
    uiElements.taskListContainer.appendChild(newTaskElement);
  }

  // Show the "delete all" button since we now have at least one task
  uiElements.deleteAllButton.style.display = "inline-block";

  // Clear the input box for the next task
  uiElements.taskTextInput.value = "";

  // Update all task numbers
  updateAllTaskNumbers();
}

/**
 * Checks if a task with the same text already exists
 * @param {string} taskText - The text to check for duplicates
 * @param {string} excludeTaskId - Optional task ID to exclude from the check (for editing)
 * @returns {boolean} - True if the task already exists
 */
function isDuplicateTaskText(taskText, excludeTaskId = null) {
  return tasks.some((task) => {
    // Skip checking the task we're currently editing
    if (excludeTaskId && task.id === excludeTaskId) {
      return false;
    }
    return task.text.toLowerCase() === taskText.toLowerCase();
  });
}

/**
 * Updates the text of an existing task
 * @param {HTMLElement} taskElement - The task to update
 * @param {string} newText - The new text for the task
 */
function updateExistingTaskText(taskElement, newText) {
  // Find the text part of the task (not the buttons or number)
  let textPart = null;
  for (const node of taskElement.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      textPart = node;
      break;
    }
  }

  // Update the text part if we found it
  if (textPart) {
    textPart.nodeValue = " " + newText + " "; // Add spaces for nicer appearance
  } else {
    // If there's no text part yet, create one
    const newTextPart = document.createTextNode(" " + newText + " ");
    taskElement.insertBefore(newTextPart, taskElement.childNodes[1]);
  }
}

/**
 * Updates the numbers of all tasks and manages the delete all button
 */
function updateAllTaskNumbers() {
  // Get all task items
  const allTasks = uiElements.taskListContainer.querySelectorAll("li");

  // Update each task's number
  allTasks.forEach((task, index) => {
    const numberLabel = task.querySelector("#number");
    if (numberLabel) {
      numberLabel.textContent = index + 1; // Start numbers at 1
    }
  });

  // Show or hide the delete all button based on whether we have tasks
  if (allTasks.length === 0) {
    uiElements.deleteAllButton.style.display = "none";
  } else {
    uiElements.deleteAllButton.style.display = "inline-block";
  }
}

/**
 * Prepares a task for editing
 * @param {HTMLElement} taskToEdit - The task to edit
 */
function prepareTaskForEditing(taskToEdit) {
  // Remove edit highlight from all tasks
  uiElements.taskListContainer
    .querySelectorAll("li")
    .forEach((task) => task.classList.remove("edit-task"));

  // Highlight the task we're editing
  taskToEdit.classList.add("edit-task");

  // Get just the task text (not the buttons or number)
  const taskText = Array.from(taskToEdit.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE) // Only text parts
    .map((node) => node.textContent.trim()) // Get the text
    .join(" ") // Join any text fragments
    .trim(); // Remove extra spaces

  // Put the task text in the input box
  uiElements.taskTextInput.value = taskText;

  // Remember which task we're editing
  taskBeingEdited = taskToEdit;

  // Change labels to show we're editing
  uiElements.modalHeading.textContent = "Edit task";
  uiElements.addButton.textContent = "Update Item";

  // Show the edit modal
  showEditModal();
}

/**
 * Shows the edit/add task modal
 */
function showEditModal() {
  // If Bootstrap is loaded, use it to show the modal
  if (typeof bootstrap !== "undefined" && bootstrapModal) {
    bootstrapModal.show();
  }
  // Otherwise, use basic DOM methods
  else {
    uiElements.taskModal.classList.add("show");
    uiElements.taskModal.style.display = "block";
    uiElements.taskModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    // Add the darkened background
    let modalBackground = document.querySelector(".modal-backdrop");
    if (!modalBackground) {
      modalBackground = document.createElement("div");
      modalBackground.className = "modal-backdrop fade show";
      document.body.appendChild(modalBackground);
    }
  }
}

/**
 * Deletes all tasks from the list
 */
function deleteAllTasks() {
  // First confirm with the user
  if (confirm("Are you sure you want to delete all tasks?")) {
    // Clear the tasks array
    tasks = [];

    // Save to local storage (which will save the empty array)
    saveTasksToStorage();

    // Remove all tasks from the DOM
    uiElements.taskListContainer.innerHTML = "";

    // Hide the delete all button
    uiElements.deleteAllButton.style.display = "none";

    // Reset editing state if we were editing
    if (taskBeingEdited) {
      taskBeingEdited = null;
      uiElements.addButton.textContent = "Add Item";
      uiElements.modalHeading.textContent = "Enter task";
      uiElements.taskTextInput.value = "";
    }
  }
}

/**
 * Deletes a single task
 * @param {HTMLElement} taskElement - The task element to delete
 */
function deleteTask(taskElement) {
  // Get the task ID
  const taskId = taskElement.dataset.taskId;

  // Remove the task from our array
  tasks = tasks.filter((task) => task.id !== taskId);

  // Save to local storage
  saveTasksToStorage();

  // Remove the task from the DOM
  taskElement.remove();

  // Update task numbers
  updateAllTaskNumbers();
}

/**
 * Switches between dark and light mode
 */
function switchDarkLightMode() {
  // Toggle dark mode class on the body
  uiElements.bodyElement.classList.toggle("dark-mode");

  // Remove border for better appearance
  uiElements.taskAppContainer.style.border = "none";

  // Check if we're in dark mode now
  const isDarkModeOn = uiElements.bodyElement.classList.contains("dark-mode");

  // Show the right icon
  uiElements.darkModeIcon.style.display = isDarkModeOn
    ? "inline-block"
    : "none";
  uiElements.lightModeIcon.style.display = isDarkModeOn
    ? "none"
    : "inline-block";

  // Save dark mode preference to local storage
  localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkModeOn);
}

/**
 * Search for tasks that match the search text
 */
function searchTasks() {
  const searchText = uiElements.searchBox.value.toLowerCase();
  const allTasks = uiElements.taskListContainer.querySelectorAll("li");

  // Check each task to see if it matches
  allTasks.forEach((task) => {
    // Get just the task text (not the buttons or number)
    const taskText = Array.from(task.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE) // Only text parts
      .map((node) => node.textContent.trim()) // Get the text
      .join(" ") // Join any text fragments
      .toLowerCase(); // Make lowercase for case-insensitive search

    // Show or hide based on search match
    if (taskText.includes(searchText)) {
      task.style.display = ""; // Show this task
    } else {
      task.style.display = "none"; // Hide this task
    }
  });
}

/**
 * Saves tasks to local storage
 */
function saveTasksToStorage() {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Loads tasks from local storage
 */
function loadTasksFromStorage() {
  // Try to get tasks from local storage
  const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);

  // If there are saved tasks, parse them
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }

  // Display the tasks
  displayTasksFromArray();
}

/**
 * Loads dark mode preference from local storage
 */
function loadDarkModeFromStorage() {
  const isDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";

  // If dark mode was saved as true, enable it
  if (isDarkMode) {
    uiElements.bodyElement.classList.add("dark-mode");
    uiElements.taskAppContainer.style.border = "none";
    uiElements.darkModeIcon.style.display = "inline-block";
    uiElements.lightModeIcon.style.display = "none";
  }
}

/**
 * Displays tasks from our tasks array
 */
function displayTasksFromArray() {
  // Clear the current list
  uiElements.taskListContainer.innerHTML = "";

  // If there are no tasks, hide the clear all button
  if (tasks.length === 0) {
    uiElements.deleteAllButton.style.display = "none";
    return;
  }

  // Show the clear all button
  uiElements.deleteAllButton.style.display = "inline-block";

  // Add each task to the list
  tasks.forEach((task, index) => {
    const taskElement = makeNewTaskItem(task.text, index + 1, task.id);
    uiElements.taskListContainer.appendChild(taskElement);
  });
}

// ===== SET UP EVENT LISTENERS =====
// These tell the browser what to do when the user interacts with our app

// Button click handlers
uiElements.addButton.addEventListener("click", handleAddOrUpdateTask);
uiElements.deleteAllButton.addEventListener("click", deleteAllTasks);
uiElements.darkModeButton.addEventListener("click", switchDarkLightMode);

// Search input handler
uiElements.searchBox.addEventListener("input", searchTasks);

// Task list click handlers (for delete and edit buttons)
uiElements.taskListContainer.addEventListener("click", (event) => {
  // Handle delete button clicks
  if (event.target.id === "remove-task") {
    const taskToDelete = event.target.closest("li");
    if (taskToDelete) {
      deleteTask(taskToDelete);
    }
  }

  // Handle edit button clicks
  if (event.target.closest(".edit-task")) {
    const taskToEdit = event.target.closest("li");
    if (taskToEdit) {
      prepareTaskForEditing(taskToEdit);
    }
  }
});

// Form submission handler (for pressing Enter in the input box)
uiElements.taskForm.addEventListener("submit", handleAddOrUpdateTask);

// Set everything up when the page loads
document.addEventListener("DOMContentLoaded", function () {
  // Load dark mode preference from storage
  loadDarkModeFromStorage();

  // Load tasks from storage
  loadTasksFromStorage();

  // Try to set up the Bootstrap modal
  function setupBootstrapModal() {
    if (typeof bootstrap !== "undefined") {
      // Create the modal if Bootstrap is loaded
      bootstrapModal = new bootstrap.Modal(uiElements.taskModal);

      // Reset editing state when modal is closed
      uiElements.taskModal.addEventListener("hidden.bs.modal", function () {
        if (taskBeingEdited) {
          taskBeingEdited.classList.remove("edit-task");
          taskBeingEdited = null;
          uiElements.addButton.textContent = "Add Item";
          uiElements.modalHeading.textContent = "Enter task";
          uiElements.taskTextInput.value = "";
        }
      });

      // Don't need to try again
      window.removeEventListener("load", setupBootstrapModal);
    } else {
      // Try again later if Bootstrap isn't loaded yet
      setTimeout(setupBootstrapModal, 500);
    }
  }

  // Try to set up right away
  setupBootstrapModal();

  // Also try when everything is fully loaded
  window.addEventListener("load", setupBootstrapModal);

  // Make sure task numbers are correct
  updateAllTaskNumbers();
});
