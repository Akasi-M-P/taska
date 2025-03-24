Task Manager

A modern, responsive task management application built with JavaScript, HTML, and CSS that helps you keep track of your tasks with a clean, intuitive interface.

![Task Manager App](https://incredible-gumption-2e6ea2.netlify.app/)

Features

- ✅ Create, edit, and delete tasks
- 🔍 Search functionality to quickly find tasks
- 🔄 Drag and drop to reorder tasks
- 🌓 Dark/light mode toggle with saved preference
- 💾 Persistent storage that saves your tasks between sessions
- 📱 Responsive design that works on all devices
- 🚫 Duplicate task prevention

Live Demo

[View the live demo](https://incredible-gumption-2e6ea2.netlify.app/)

How to Use

Adding Tasks

1. Click the "Add Task" button or press Enter in the input field
2. Type your task in the modal that appears
3. Click "Add Item" or press Enter to add the task

Editing Tasks

1. Click the "edit" button next to any task
2. Modify the task text in the modal
3. Click "Update Item" to save your changes

Organizing Tasks

- **Reorder**: Drag and drop tasks to change their order
- **Search**: Type in the search box to filter tasks
- **Delete**: Click the trash icon to remove a specific task
- **Clear All**: Use the "Delete All" button to remove all tasks (with confirmation)

Appearance

- Toggle between dark and light modes using the mode switch button
- Your preference will be saved for future visits

Technical Details

Local Storage
The app uses the browser's localStorage API to save:

- Task data (text and unique IDs)
- Dark/light mode preference

Key Components

Task Structure
Each task consists of:

- Unique ID (timestamp-based)
- Task text
- Number indicator
- Edit button
- Delete button

Drag and Drop
The app implements native HTML5 drag and drop functionality for task reordering:

- Tasks maintain their new order between sessions
- Order is visually indicated with automatically updating numbers

Modal System

- Compatible with Bootstrap's modal system if available
- Falls back to native implementation if Bootstrap is not loaded

Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/task-manager.git
   ```

2. Open the index.html file in your browser or set up a local server.

3. No build step required - the application works out of the box!
   Customization

Styling
The app uses CSS variables for easy theme customization. Modify the `:root` variables in your CSS file to change colors, fonts, and other visual elements.

### Dependencies

The core app has no required external dependencies, but it will use Bootstrap's modal system if available.

Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Works on mobile browsers

Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Acknowledgments

- Font Awesome for the icons
- Bootstrap for the modal system (optional)
