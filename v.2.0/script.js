// ====================
// DOM ELEMENTS
// ====================
const darkMode = document.getElementById("dark-mode");
const lightMode = document.querySelector(".light-mode");
const body = document.querySelector("body");

const taskList = document.getElementById("container");
const openTaskForm = document.getElementById("add-task");
const closeTaskForm = document.querySelector(".close-modal");

const addTaskForm = document.getElementById("task-form");
const taskInputField = document.getElementById("task-input");

const clearAllBtn = document.getElementById("clear-all");
const searchTask = document.getElementById("search-task");

let isEditMode = false; // Tracks if we're editing a task
let taskToEdit = null; // Tracks the task being edited

// ====================
// THEME FUNCTIONS
// ====================
function enableDarkMode() {
  body.classList.add("dark-mode");
  lightMode.style.display = "block";
  darkMode.style.display = "none";
  localStorage.setItem("theme", "dark"); // Save theme preference
}

function enableLightMode() {
  body.classList.remove("dark-mode");
  darkMode.style.display = "block";
  lightMode.style.display = "none";
  localStorage.setItem("theme", "light"); // Save theme preference
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    enableDarkMode();
  } else {
    enableLightMode();
  }
}

// ====================
// TASK FORM FUNCTIONS
// ====================
function openForm() {
  document.getElementById("modal").style.display = "block";
}

function closeForm() {
  document.getElementById("modal").style.display = "none";
  taskInputField.value = ""; // Clear input field
  isEditMode = false; // Reset edit mode
  taskToEdit = null; // Reset task to edit
  document.querySelector(".save-btn").textContent = "Save"; // Reset button text
}

// ====================
// TASK MANAGEMENT FUNCTIONS
// ====================
function checkDuplication(taskItem) {
  const tasks = taskList.querySelectorAll("li");
  for (const task of tasks) {
    if (task.firstChild.textContent === taskItem) {
      alert("Task already exists");
      return true; // Return true if duplicate
    }
  }
  return false; // Return false if not a duplicate
}

function createTaskElement(taskContent) {
  const task = document.createElement("li");
  task.id = "task";

  // Add task content
  task.appendChild(document.createTextNode(taskContent));

  // Create edit button
  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";

  // Add buttons to the task
  task.appendChild(editBtn);
  task.appendChild(deleteBtn);

  return task;
}

function createNewTask(e) {
  e.preventDefault();
  const inputValue = taskInputField.value.trim();

  if (!inputValue) {
    alert("Please enter a task");
    return;
  }

  // If in edit mode, update the existing task
  if (isEditMode && taskToEdit) {
    if (checkDuplication(inputValue)) return; // Stop if duplicate
    taskToEdit.firstChild.textContent = inputValue; // Update task content
  } else {
    // If not in edit mode, create a new task
    if (checkDuplication(inputValue)) return; // Stop if duplicate
    const task = createTaskElement(inputValue);
    taskList.appendChild(task);
  }

  saveTaskToLocalStorage(); // Save to localStorage
  closeForm(); // Close the form
  resetUI(); // Update the UI
}

// ====================
// LOCAL STORAGE FUNCTIONS
// ====================
function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });
  resetUI();
}

function saveTaskToLocalStorage() {
  const tasks = [];
  taskList.querySelectorAll("li").forEach((task) => {
    tasks.push(task.firstChild.textContent);
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ====================
// TASK INTERACTION FUNCTIONS
// ====================
function deleteTask(taskElement) {
  taskElement.remove();
  saveTaskToLocalStorage();
  resetUI();
}

function editTask(taskElement) {
  taskToEdit = taskElement; // Set the task to edit
  taskInputField.value = taskToEdit.firstChild.textContent; // Populate input field
  openForm(); // Open the form
  isEditMode = true; // Enable edit mode
  document.querySelector(".save-btn").textContent = "Update"; // Change button text
}

function onClearAllTasks() {
  taskList.innerHTML = ""; // Clear all tasks
  saveTaskToLocalStorage();
  resetUI();
}

function onSearchTask(e) {
  const searchValue = e.target.value.toLowerCase();
  const tasks = taskList.querySelectorAll("li");

  tasks.forEach((task) => {
    const taskContent = task.firstChild.textContent.toLowerCase();
    task.style.display = taskContent.includes(searchValue) ? "flex" : "none";
  });
}

// ====================
// UI FUNCTIONS
// ====================
function resetUI() {
  clearAllBtn.style.display = taskList.children.length === 0 ? "none" : "block";
}

// ====================
// EVENT LISTENERS
// ====================
openTaskForm.addEventListener("click", openForm);
closeTaskForm.addEventListener("click", closeForm);
addTaskForm.addEventListener("submit", createNewTask);
clearAllBtn.addEventListener("click", onClearAllTasks);
searchTask.addEventListener("input", onSearchTask);

taskList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    deleteTask(e.target.parentElement);
  } else if (e.target.classList.contains("edit-btn")) {
    editTask(e.target.parentElement);
  }
});

darkMode.addEventListener("click", enableDarkMode);
lightMode.addEventListener("click", enableLightMode);

// ====================
// INITIALIZATION
// ====================
document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromLocalStorage(); // Load tasks
  loadTheme(); // Load theme
});
