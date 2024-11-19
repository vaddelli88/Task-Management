from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class TaskSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'priority', 'status', 'deadline', 'user']
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        task = Task.objects.create(user=user, **validated_data)
        return task

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.priority = validated_data.get('priority', instance.priority)
        instance.status = validated_data.get('status', instance.status)
        instance.deadline = validated_data.get('deadline', instance.deadline)
        instance.save()
        return instance