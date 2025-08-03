from django.db import models
from django.conf import settings
from django.utils import timezone

class MindMap(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mindmaps')
    title = models.CharField(max_length=200)
    main_topic = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"

class MindMapNode(models.Model):
    mind_map = models.ForeignKey(MindMap, on_delete=models.CASCADE, related_name='nodes')
    label = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default='📝')
    color = models.CharField(max_length=7, default='#4CAF50')
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    level = models.IntegerField(default=0)  # 0: ana konu, 1: alt konu, 2: detay
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['level', 'created_at']
    
    def __str__(self):
        return f"{self.mind_map.title} - {self.label}"

class MindMapConnection(models.Model):
    mind_map = models.ForeignKey(MindMap, on_delete=models.CASCADE, related_name='connections')
    source_node = models.ForeignKey(MindMapNode, on_delete=models.CASCADE, related_name='outgoing_connections')
    target_node = models.ForeignKey(MindMapNode, on_delete=models.CASCADE, related_name='incoming_connections')
    connection_type = models.CharField(max_length=50, default='default')  # default, strong, weak
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['source_node', 'target_node']
    
    def __str__(self):
        return f"{self.source_node.label} → {self.target_node.label}" 