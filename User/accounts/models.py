from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    STATUS_CHOICES = [
        ('Yet-to-start', 'Yet-to-start'),
        ('In-progress', 'In-progress'),
        ('Completed', 'Completed'),
        ('Hold', 'Hold'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(choices=PRIORITY_CHOICES, max_length=10)
    status = models.CharField(choices=STATUS_CHOICES, max_length=15, default='Yet-to-start')
    deadline = models.DateField()
    created_at = models.DateTimeField(default=timezone.now)  # Changed this line
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title