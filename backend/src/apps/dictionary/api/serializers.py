from rest_framework import serializers
from dictionary.models import CFSStatus, CFSType, CFSCategory, CFSSubCategory

class CFSStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSStatus
        fields = '__all__'

class CFSTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSType
        fields = '__all__'

class CFSCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSCategory
        fields = '__all__'

class CFSSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CFSSubCategory
        fields = '__all__'