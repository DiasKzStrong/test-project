from rest_framework import serializers
from apps.cfs.models import CFS
from apps.dictionary.api.serializers import CFSCategorySerializer, CFSStatusSerializer, CFSTypeSerializer,CFSSubCategorySerializer

class CFSSerializer(serializers.ModelSerializer):
    status = CFSStatusSerializer()
    type = CFSTypeSerializer()
    category = CFSCategorySerializer()
    sub_category = CFSSubCategorySerializer()
    
    class Meta:
        model = CFS
        fields = ['id', 'date', 'amount', 'comment', 'status', 'type', 'category', 'sub_category']
    

class CFSCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFS
        fields = ['date', 'amount', 'comment', 'status', 'type', 'category', 'sub_category']
