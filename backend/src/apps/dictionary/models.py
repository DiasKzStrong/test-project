from django.db import models
from core.models import BaseModel


class CFSStatus(BaseModel):
    """
    Статусы для ДДС
    """
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class CFSType(BaseModel):
    """
    Типы для ДДС
    """
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name
    
class CFSCategory(BaseModel):
    """
    Категории для ДДС
    """
    name = models.CharField(max_length=255, unique=True)
    cfs_type = models.ForeignKey(CFSType, on_delete=models.CASCADE, related_name='categories')
    
    def __str__(self):
        return self.name
    
class CFSSubCategory(BaseModel):
    """
    Подкатегории для ДДС
    """
    name = models.CharField(max_length=255, unique=True)
    cfs_category = models.ForeignKey(CFSCategory, on_delete=models.CASCADE, related_name='subcategories')
    
    def __str__(self):
        return self.name