from rest_framework import serializers
from cfs.models import CFS

class CFSSerializer(serializers.ModelSerializer):
    class Meta:
        model = CFS
        fields = '__all__'
        exclude = ['updated_at']
    
