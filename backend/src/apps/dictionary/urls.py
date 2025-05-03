from rest_framework.routers import SimpleRouter

from apps.dictionary.api.viewsets import CFSCategoryViewSet, CFSStatusViewSet, CFSSubCategoryViewSet, CFSTypeViewSet

router = SimpleRouter()
router.register(r'cfs-statuses', CFSStatusViewSet)
router.register(r'cfs-types', CFSTypeViewSet)
router.register(r'cfs-categories', CFSCategoryViewSet)
router.register(r'cfs-subcategories', CFSSubCategoryViewSet)

urlpatterns = router.urls