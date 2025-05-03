from core.models import BaseModel
from django.db import models
from django.core.exceptions import ValidationError
import datetime
# Create your models here.
class CFS(BaseModel):
    '''
    Модель для ДДС

    type,category,sub_category,user - обязательные поля, из-за этого сделал их CASCADE
    '''
    date = models.DateField(default=datetime.date.today)
    status = models.ForeignKey('dictionary.CFSStatus', on_delete=models.SET_NULL, null=True,blank=True)
    type = models.ForeignKey('dictionary.CFSType', on_delete=models.CASCADE)
    category = models.ForeignKey('dictionary.CFSCategory', on_delete=models.CASCADE)
    sub_category = models.ForeignKey('dictionary.CFSSubCategory', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=15, decimal_places=2)   
    comment = models.TextField(null=True,blank=True)
    
    def __str__(self):
        return f"{self.date} - {self.status} - {self.type} - {self.category} - {self.sub_category}"
    
    def clean(self):
       if not self.type.id == self.category.cfs_type.id:
           raise ValidationError("Тип и категория не совпадают")
       if not self.category.id == self.sub_category.cfs_category.id:
           raise ValidationError("Категория и подкатегория не совпадают")
    