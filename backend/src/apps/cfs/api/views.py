from rest_framework.viewsets import ModelViewSet
from .serializers import CFSSerializer, CFSCreateSerializer
from apps.cfs.models import CFS
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .pagination import CFSPagination
class CFSViewSet(ModelViewSet):
    """
    API-конечная точка для управления записями ДДС.
    
    Предоставляет операции CRUD для записей ДДС с возможностями фильтрации.
    """
    queryset = CFS.objects.all()
    serializer_class = CFSSerializer
    pagination_class = CFSPagination
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name="date_from", description="Filter by start date (DD-MM-YYYY)", type=OpenApiTypes.DATE),
            OpenApiParameter(name="date_to", description="Filter by end date (DD-MM-YYYY)", type=OpenApiTypes.DATE),
            OpenApiParameter(name="status", description="Filter by status", type=OpenApiTypes.STR),
            OpenApiParameter(name="type", description="Filter by CFS type", type=OpenApiTypes.STR),
            OpenApiParameter(name="category", description="Filter by category", type=OpenApiTypes.STR),
            OpenApiParameter(name="subcategory", description="Filter by subcategory", type=OpenApiTypes.STR),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = CFS.objects.all().select_related('status', 'type', 'category', 'sub_category')
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by type
        cfs_type = self.request.query_params.get('type')
        if cfs_type:
            queryset = queryset.filter(type=cfs_type)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by subcategory
        subcategory = self.request.query_params.get('subcategory')
        if subcategory:
            queryset = queryset.filter(sub_category=subcategory)
        
        amount = self.request.query_params.get('amount')
        if amount:
            queryset = queryset.filter(amount__gte=amount)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CFSCreateSerializer
        return super().get_serializer_class()   