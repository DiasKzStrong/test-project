from rest_framework.views import APIView
from .serializers import CFSSerializer
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework import status
from cfs.models import CFS

class CFSView(APIView):
    @extend_schema(
        summary="Получить все записи",
        description="Получает все записи из модели CFS",
        responses={
            status.HTTP_200_OK: CFSSerializer(many=True),
        },
    )
    def get(self, request):
        cfs = CFS.objects.all()
        serializer = CFSSerializer(cfs, many=True)
        return Response(serializer.data)
    
    