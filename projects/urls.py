from rest_framework.routers import DefaultRouter
from .views import AmenityViewSet, ApartmentTypeViewSet, GalleryViewSet, ProgressImageViewSet, ProgressViewSet, ProjectViewSet, PropertyTypeViewSet, UnitViewSet
router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("amenities", AmenityViewSet)
router.register("property-types", PropertyTypeViewSet)
router.register("apartment-types", ApartmentTypeViewSet)
router.register("units", UnitViewSet)
router.register("gallery", GalleryViewSet)
router.register("progress", ProgressViewSet)
router.register("progress-images", ProgressImageViewSet)
urlpatterns = router.urls
