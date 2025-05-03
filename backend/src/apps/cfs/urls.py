from apps.cfs.api import views
from rest_framework.routers import SimpleRouter

router = SimpleRouter()

router.register(r'', views.CFSViewSet)

urlpatterns = router.urls
