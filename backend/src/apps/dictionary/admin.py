from django.contrib import admin
from apps.dictionary.models import CFSType, CFSCategory, CFSSubCategory, CFSStatus
# Register your models here.

@admin.register(CFSStatus)
class CFSStatusAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(CFSType)
class CFSTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(CFSCategory)
class CFSCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(CFSSubCategory)
class CFSSubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)


