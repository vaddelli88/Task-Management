document.getElementById('create-task').addEventListener('submit', async function(event) {
    event.preventDefault();

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const priority = document.getElementById('task-priority').value;
    const status = document.getElementById('task-status').value || 'Yet-to-start';  // Default if not provided
    const deadline = document.getElementById('task-deadline').value;

    if (title && description && priority && deadline) {
        try {
            // Get the token from localStorage
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                alert('Access token is missing. Please log in again.');
                return;
            }

            const taskData = {
                title,
                description,
                priority,
                status,
                deadline
            };

            console.log('Sending data to backend:', taskData);  // Log data to check

            const response = await fetch('http://127.0.0.1:8000/tasks/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,  // Pass token here
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                alert('Task created successfully');
                fetchTasks();  // Refresh the task list
                document.getElementById('task-form').reset();  // Reset the form
                document.getElementById('task-form-container').classList.add('hidden');  // Hide the form
            } else {
                const errorData = await response.json();
                console.error('Failed to create task:', errorData);
                alert('Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    } else {
        alert('All fields (title, description, priority, deadline) are required');
    }
});
