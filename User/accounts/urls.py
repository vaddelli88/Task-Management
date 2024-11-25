from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('tasks/', views.get_task_list, name='task-list'),
    path('create-task/', views.create_task, name='create-task'),
    path('tasks/priority/<str:priority>/', views.get_task_by_priority, name='tasks-by-priority'),
    path('tasks/deadline/<str:deadline>/', views.get_task_by_deadline, name='tasks-by-deadline'),
    path('update-task/<int:task_id>/', views.update_task, name='update-task'),
    path('delete-task/<int:task_id>/', views.delete_task, name='delete-task'),
    path('tasks/<int:task_id>/', views.get_single_task, name='get-single-task'),
]