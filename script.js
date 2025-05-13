// Task Management System
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.initializeEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    initializeEventListeners() {
        // Add task
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.filter-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTasks();
        });

        // Theme toggle
        document.querySelector('.theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const icon = document.querySelector('.theme-toggle i');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const dueDate = document.getElementById('dueDate');
        const priority = document.getElementById('priority');

        if (!taskInput.value.trim()) {
            this.showNotification('Please enter a task description', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            title: taskInput.value.trim(),
            completed: false,
            dueDate: dueDate.value,
            priority: priority.value,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        taskInput.value = '';
        dueDate.value = '';
        priority.value = 'low';

        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.showNotification('Task deleted successfully!', 'success');
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            const newTitle = prompt('Edit task:', task.title);
            if (newTitle && newTitle.trim()) {
                task.title = newTitle.trim();
                this.saveTasks();
                this.renderTasks();
                this.showNotification('Task updated successfully!', 'success');
            }
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        const filteredTasks = this.tasks.filter(task => {
            const matchesFilter = this.currentFilter === 'all' ||
                (this.currentFilter === 'active' && !task.completed) ||
                (this.currentFilter === 'completed' && task.completed);

            const matchesSearch = task.title.toLowerCase().includes(this.searchQuery);

            return matchesFilter && matchesSearch;
        });

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-title">${task.title}</span>
                    <div class="task-meta">
                        ${task.dueDate ? `<span><i class="far fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" title="Edit task"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" title="Delete task"><i class="fas fa-trash"></i></button>
                </div>
            `;

            // Add event listeners
            taskElement.querySelector('.task-checkbox').addEventListener('change', () => this.toggleTaskStatus(task.id));
            taskElement.querySelector('.edit-btn').addEventListener('click', () => this.editTask(task.id));
            taskElement.querySelector('.delete-btn').addEventListener('click', () => this.deleteTask(task.id));

            tasksList.appendChild(taskElement);
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the task manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
}); 