from django.db import models
from core.models import BaseModel
# Create your models here.

class CFSStatus(BaseModel):
    name = models.CharField(max_length=255)
    
    def __str__(self):
        return self.name

class CFSType(BaseModel):
    name = models.CharField(max_length=255)
    
    def __str__(self):
        return self.name
    
class CFSCategory(BaseModel):
    name = models.CharField(max_length=255)
    cfs_type = models.ForeignKey(CFSType, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name
    
class CFSSubCategory(BaseModel):
    name = models.CharField(max_length=255)
    cfs_category = models.ForeignKey(CFSCategory, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name