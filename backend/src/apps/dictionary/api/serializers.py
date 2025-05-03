from rest_framework import serializers
from apps.dictionary.models import CFSStatus, CFSType, CFSCategory, CFSSubCategory

class CFSStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSStatus
        fields = ['id', 'name']

class CFSTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSType
        fields = ['id', 'name']

class CFSTypeWithCategoriesSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    
    def get_categories(self, obj):
        return CFSCategorySerializer(obj.categories.all(), many=True).data
    
    class Meta:
        model = CFSType
        fields = ['id', 'name', 'categories']

class CFSCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSCategory
        fields = ['id', 'name']

class CFSCategoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSCategory
        fields = ['id', 'name', 'cfs_type']

class CFSCategoryWithTypeSerializer(serializers.ModelSerializer):
    cfs_type = CFSTypeSerializer()
    
    class Meta:
        model = CFSCategory
        fields = ['id', 'name', 'cfs_type']
    
class CFSCategoryWithSubCategoriesSerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    
    def get_subcategories(self, obj):
        return CFSSubCategorySerializer(obj.subcategories.all(), many=True).data
    
    class Meta:
        model = CFSCategory
        fields = ['id', 'name', 'subcategories']
        
class CFSSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSSubCategory
        fields = ['id', 'name']

class CFSSubCategoryCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSSubCategory
        fields = ['id', 'name', 'cfs_category']

class CFSSubCategoryWithCategorySerializer(serializers.ModelSerializer):
    cfs_category = CFSCategorySerializer()
    
    class Meta:
        model = CFSSubCategory
        fields = ['id', 'name', 'cfs_category']