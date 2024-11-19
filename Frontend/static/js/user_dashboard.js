const API_BASE_URL = 'http://127.0.0.1:8000';

// Utility Functions
function showLoading(show = true) {
    const loadingElement = document.getElementById('loading');
    loadingElement.classList.toggle('hidden', !show);
}

function handleApiError(error, message) {
    console.error(message, error);
    alert(`${message}. Please try again.`);
}

// Authentication Functions
async function checkAuthentication() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

// Task Management Functions
async function fetchTasks() {
    if (!await checkAuthentication()) return;
    
    showLoading(true);
    try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/tasks/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Fetch tasks response:', response);

        if (response.status === 401) {
            if (await refreshToken()) {
                return await fetchTasks();
            } else {
                window.location.href = '/login';
                return;
            }
        }

        if (response.ok) {
            const tasks = await response.json();
            console.log('Fetched tasks:', tasks);
            displayTasks(tasks);
        } else {
            const errorData = await response.json();
            handleApiError(errorData, 'Failed to fetch tasks');
        }
    } catch (error) {
        handleApiError(error, 'Error fetching tasks');
    } finally {
        showLoading(false);
    }
}

function displayTasks(tasks) {
    const taskList = document.getElementById('task-list');
    const noTasksMessage = document.getElementById('no-tasks');

    if (!tasks || tasks.length === 0) {
        noTasksMessage.classList.remove('hidden');
        taskList.innerHTML = '';
        return;
    }

    noTasksMessage.classList.add('hidden');
    taskList.innerHTML = tasks.map(task => `
        <div class="task" data-task-id="${task.id}">
            <div class="task-header">
                <h3>${task.title}</h3>
                <div class="task-badges">
                    <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
                    <span class="status-badge ${task.status.toLowerCase()}">${task.status}</span>
                </div>
            </div>
            <div class="task-body">
                <p>${task.description}</p>
                <p class="deadline">Due: ${new Date(task.deadline).toLocaleDateString()}</p>
            </div>
            <div class="task-actions">
                <button onclick="editTask(${task.id})" class="edit-btn">Edit</button>
                <button onclick="deleteTask(${task.id})" class="delete-btn">Delete</button>
                <button onclick="toggleTaskStatus(${task.id})" class="status-btn">
                    ${task.status === 'Completed' ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
            </div>
        </div>
    `).join('');
}

async function createTask(taskData) {
    if (!await checkAuthentication()) return;

    showLoading(true);
    try {
        const accessToken = localStorage.getItem('access_token');
        
        const formattedData = {
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            status: taskData.status || 'Yet-to-start',
            deadline: taskData.deadline
        };

        console.log('Creating task with data:', formattedData);

        const response = await fetch(`${API_BASE_URL}/create-task/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedData)
        });

        console.log('Create task response:', response);

        if (response.status === 401) {
            if (await refreshToken()) {
                return await createTask(taskData);
            } else {
                window.location.href = '/login';
                return false;
            }
        }

        if (response.ok) {
            const data = await response.json();
            console.log('Task created successfully:', data);
            await fetchTasks();
            return true;
        } else {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            handleApiError(errorData, 'Failed to create task');
            return false;
        }
    } catch (error) {
        console.error('Create task error:', error);
        handleApiError(error, 'Error creating task');
        return false;
    } finally {
        showLoading(false);
    }
}

async function updateTask(taskId, taskData) {
    if (!await checkAuthentication()) return;

    showLoading(true);
    try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/update-task/${taskId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        console.log('Update task response:', response);

        if (response.status === 401) {
            if (await refreshToken()) {
                return await updateTask(taskId, taskData);
            } else {
                window.location.href = '/login';
                return false;
            }
        }

        if (response.ok) {
            const data = await response.json();
            console.log('Task updated successfully:', data);
            await fetchTasks();
            return true;
        } else {
            const errorData = await response.json();
            handleApiError(errorData, 'Failed to update task');
            return false;
        }
    } catch (error) {
        handleApiError(error, 'Error updating task');
        return false;
    } finally {
        showLoading(false);
    }
}

async function deleteTask(taskId) {
    if (!await checkAuthentication()) return;

    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    showLoading(true);
    try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/delete-task/${taskId}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.status === 401) {
            if (await refreshToken()) {
                return await deleteTask(taskId);
            } else {
                window.location.href = '/login';
                return;
            }
        }

        if (response.ok) {
            await fetchTasks();
        } else {
            const errorData = await response.json();
            handleApiError(errorData, 'Failed to delete task');
        }
    } catch (error) {
        handleApiError(error, 'Error deleting task');
    } finally {
        showLoading(false);
    }
}

// Form Management
function showTaskForm(taskData = null) {
    const formContainer = document.getElementById('task-form-container');
    const form = document.getElementById('task-form');
    
    form.reset();
    
    if (taskData) {
        form.elements['task-title'].value = taskData.title;
        form.elements['task-description'].value = taskData.description;
        form.elements['task-priority'].value = taskData.priority;
        form.elements['task-status'].value = taskData.status;
        form.elements['task-deadline'].value = taskData.deadline;
        form.dataset.taskId = taskData.id;
    } else {
        delete form.dataset.taskId;
    }
    
    formContainer.classList.remove('hidden');
}

function closeTaskForm() {
    const formContainer = document.getElementById('task-form-container');
    formContainer.classList.add('hidden');
    document.getElementById('task-form').reset();
}

async function editTask(taskId) {
    if (!await checkAuthentication()) return;

    showLoading(true);
    try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const task = await response.json();
            showTaskForm(task);
        } else {
            handleApiError(response, 'Failed to fetch task details');
        }
    } catch (error) {
        handleApiError(error, 'Error fetching task details');
    } finally {
        showLoading(false);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    if (!await checkAuthentication()) return;

    // Set username
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    }

    // Initialize tasks
    await fetchTasks();

    // Task form submission
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status').value,
            deadline: document.getElementById('task-deadline').value
        };

        console.log('Submitting task:', taskData);

        const taskId = taskForm.dataset.taskId;
        let success;
        
        if (taskId) {
            success = await updateTask(taskId, taskData);
        } else {
            success = await createTask(taskData);
        }

        if (success) {
            closeTaskForm();
        }
    });

    // Create task button
    document.getElementById('create-task-btn').addEventListener('click', () => {
        showTaskForm();
    });

    // Filter listeners
    document.getElementById('filter-priority').addEventListener('change', fetchTasks);
    document.getElementById('filter-status').addEventListener('change', fetchTasks);
});

// Logout function
async function logout() {
    try {
        const accessToken = localStorage.getItem('access_token');
        await fetch(`${API_BASE_URL}/logout/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.clear();
        window.location.href = '/login';
    }
}

// Add these functions at the end of the file

async function toggleTaskStatus(taskId) {
    if (!await checkAuthentication()) return;

    showLoading(true);
    try {
        const accessToken = localStorage.getItem('access_token');
        
        // First get the current task
        const getResponse = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!getResponse.ok) {
            throw new Error('Failed to fetch task');
        }

        const task = await getResponse.json();
        
        // Toggle the status
        const newStatus = task.status === 'Completed' ? 'Yet-to-start' : 'Completed';
        
        // Update the task with new status
        const response = await fetch(`${API_BASE_URL}/update-task/${taskId}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...task,
                status: newStatus
            })
        });

        if (response.ok) {
            await fetchTasks(); // Refresh the task list
        } else {
            const errorData = await response.json();
            handleApiError(errorData, 'Failed to update task status');
        }
    } catch (error) {
        handleApiError(error, 'Error updating task status');
    } finally {
        showLoading(false);
    }
}

async function editTask(taskId) {
    if (!await checkAuthentication()) return;

    showLoading(true);
    try {
        const accessToken = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const task = await response.json();
            // Format the date for the input field (YYYY-MM-DD)
            const formattedDate = new Date(task.deadline).toISOString().split('T')[0];
            
            showTaskForm({
                ...task,
                deadline: formattedDate
            });
        } else {
            handleApiError(response, 'Failed to fetch task details');
        }
    } catch (error) {
        handleApiError(error, 'Error fetching task details');
    } finally {
        showLoading(false);
    }
}