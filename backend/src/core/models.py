from django.db import models
import datetime

class BaseModel(models.Model):
    created_at = models.DateField(default=datetime.date.today())
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
