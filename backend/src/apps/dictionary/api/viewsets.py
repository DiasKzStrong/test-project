from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from apps.dictionary.models import CFSStatus, CFSCategory, CFSSubCategory, CFSType
from .serializers import CFSStatusSerializer, CFSSubCategoryWithCategorySerializer, CFSTypeSerializer, CFSTypeWithCategoriesSerializer,CFSCategoryWithSubCategoriesSerializer, CFSCategoryWithTypeSerializer
from rest_framework.response import Response

class CFSStatusViewSet(ModelViewSet):
    queryset = CFSStatus.objects.all()
    serializer_class = CFSStatusSerializer

class CFSTypeViewSet(ModelViewSet):
    queryset = CFSType.objects.all()
    serializer_class = CFSTypeSerializer 

    @action(detail=False, methods=['get'])
    def categories(self, request):
        queryset = self.get_queryset()
        serializer = CFSTypeWithCategoriesSerializer(queryset.prefetch_related('categories'), many=True)
        return Response(serializer.data)
    
class CFSCategoryViewSet(ModelViewSet):
    queryset = CFSCategory.objects.all()
    serializer_class = CFSCategoryWithTypeSerializer
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            from .serializers import CFSCategoryCreateUpdateSerializer
            return CFSCategoryCreateUpdateSerializer
        return super().get_serializer_class()
    
    @action(detail=False, methods=['get'])
    def subcategories(self, request):
        queryset = self.get_queryset()
        serializer = CFSCategoryWithSubCategoriesSerializer(queryset.prefetch_related('subcategories'), many=True)
        return Response(serializer.data)

class CFSSubCategoryViewSet(ModelViewSet):
    queryset = CFSSubCategory.objects.all()
    serializer_class = CFSSubCategoryWithCategorySerializer
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            from .serializers import CFSSubCategoryCreateUpdateSerializer
            return CFSSubCategoryCreateUpdateSerializer
        return super().get_serializer_class()