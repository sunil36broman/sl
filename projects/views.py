import hashlib
from django.core.cache import cache
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from common.mixins import AuditActorMixin
from common.permissions import IsProjectManager
from amenities.models import Amenity
from media_gallery.models import GalleryItem, ProgressImage
from properties.models import ApartmentType, Unit
from .filters import ProjectFilter
from .models import ConstructionProgress, Project, PropertyType
from .serializers import AmenitySerializer, ApartmentTypeSerializer, ConstructionProgressSerializer, GalleryItemSerializer, ProgressImageSerializer, ProjectDetailSerializer, ProjectListSerializer, PropertyTypeSerializer, UnitSerializer

class ManagedViewSet(AuditActorMixin, viewsets.ModelViewSet):
    permission_classes = [IsProjectManager]

class ProjectViewSet(ManagedViewSet):
    filterset_class = ProjectFilter
    search_fields = ("name", "code", "short_description", "address")
    ordering_fields = ("created_at", "display_order", "min_price", "expected_handover_date")
    lookup_field = "pk"
    def get_queryset(self):
        queryset = Project.objects.select_related("property_type", "division", "district", "area")
        if self.action in ("retrieve", "by_slug"): queryset = queryset.prefetch_related("amenities", "apartment_types", "gallery_items", "progress_updates")
        if not self.request.user.is_authenticated: queryset = queryset.filter(publication_status=Project.Publication.PUBLISHED)
        return queryset.distinct()
    def get_serializer_class(self): return ProjectListSerializer if self.action == "list" else ProjectDetailSerializer
    def list(self, request, *args, **kwargs):
        if request.user.is_authenticated: return super().list(request,*args,**kwargs)
        version=cache.get("project-list-version",1)
        key=f"project-list:{version}:{hashlib.sha256(request.get_full_path().encode()).hexdigest()}"
        cached=cache.get(key)
        if cached is not None: return Response(cached)
        response=super().list(request,*args,**kwargs); cache.set(key,response.data,300); return response
    @action(detail=False, url_path="slug/(?P<slug>[-a-zA-Z0-9_]+)")
    def by_slug(self, request, slug=None):
        obj = self.get_queryset().get(slug=slug); return Response(ProjectDetailSerializer(obj, context={"request": request}).data)
    @action(detail=False)
    def featured(self, request):
        qs = self.filter_queryset(self.get_queryset().filter(is_featured=True)); return Response(ProjectListSerializer(qs, many=True, context={"request": request}).data)
    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsProjectManager])
    def status(self, request, pk=None):
        obj = self.get_object(); serializer = ProjectDetailSerializer(obj, data={"status": request.data.get("status")}, partial=True); serializer.is_valid(raise_exception=True); self.perform_update(serializer); return Response(serializer.data)
    def _nested(self, request, manager, serializer_cls, project_field=True):
        project = self.get_object()
        if request.method == "GET": return Response(serializer_cls(manager.filter(project=project), many=True, context={"request": request}).data)
        serializer = serializer_cls(data=request.data, many=isinstance(request.data, list), context={"request": request}); serializer.is_valid(raise_exception=True); serializer.save(project=project, created_by=request.user, updated_by=request.user); return Response(serializer.data, status=201)
    @action(detail=True, methods=["get", "post"], url_path="apartment-types")
    def apartment_types(self, request, pk=None): return self._nested(request, ApartmentType.objects, ApartmentTypeSerializer)
    @action(detail=True, methods=["get", "post"])
    def units(self, request, pk=None): return self._nested(request, Unit.objects, UnitSerializer)
    @action(detail=True, methods=["get", "post"])
    def gallery(self, request, pk=None): return self._nested(request, GalleryItem.objects, GalleryItemSerializer)
    @action(detail=True, methods=["get", "post"], url_path="floor-plans")
    def floor_plans(self, request, pk=None):
        project = self.get_object(); qs = GalleryItem.objects.filter(project=project, kind=GalleryItem.Kind.FLOOR_PLAN)
        if request.method == "GET": return Response(GalleryItemSerializer(qs, many=True, context={"request": request}).data)
        data = request.data.copy(); data["project"] = project.pk; data["kind"] = GalleryItem.Kind.FLOOR_PLAN
        serializer = GalleryItemSerializer(data=data, context={"request": request}); serializer.is_valid(raise_exception=True); self.perform_create(serializer); return Response(serializer.data, status=201)
    @action(detail=True, methods=["get", "post"])
    def progress(self, request, pk=None): return self._nested(request, ConstructionProgress.objects, ConstructionProgressSerializer)
    @action(detail=True, methods=["put"])
    def amenities(self, request, pk=None):
        project = self.get_object(); ids = request.data.get("amenity_ids", []); project.amenities.set(Amenity.objects.filter(id__in=ids)); return Response(ProjectDetailSerializer(project, context={"request": request}).data)

class AmenityViewSet(ManagedViewSet):
    queryset = Amenity.objects.all().order_by("name")
    serializer_class = AmenitySerializer
    search_fields = ("name",)
    parser_classes = (MultiPartParser, FormParser, JSONParser)
class PropertyTypeViewSet(ManagedViewSet):
    queryset = PropertyType.objects.all()
    serializer_class = PropertyTypeSerializer
    search_fields = ("name", "slug", "description")
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(is_active=True) if self.action == "list" else queryset
    def perform_destroy(self, instance):
        if instance.projects.exists():
            instance.is_active = False
            instance.updated_by = self.request.user if self.request.user.is_authenticated else None
            instance.save(update_fields=["is_active", "updated_by", "updated_at"])
        else:
            instance.delete()
class ApartmentTypeViewSet(ManagedViewSet): queryset = ApartmentType.objects.select_related("project"); serializer_class = ApartmentTypeSerializer; filterset_fields = ("project", "is_active"); search_fields = ("name", "project__name", "facing")
class UnitViewSet(ManagedViewSet):
    queryset = Unit.objects.select_related("project", "apartment_type"); serializer_class = UnitSerializer
    filterset_fields = ("project", "apartment_type", "availability", "is_active"); search_fields = ("unit_number", "building", "project__name", "apartment_type__name")
    @action(detail=True, methods=["patch"])
    def availability(self, request, pk=None):
        obj = self.get_object(); serializer = self.get_serializer(obj, data={"availability": request.data.get("availability")}, partial=True); serializer.is_valid(raise_exception=True); self.perform_update(serializer); return Response(serializer.data)
class GalleryViewSet(ManagedViewSet):
    queryset = GalleryItem.objects.select_related("project"); serializer_class = GalleryItemSerializer
    filterset_fields = ("project", "kind", "is_active"); search_fields = ("caption", "alt_text", "project__name")
    def get_permissions(self):
        return [AllowAny()] if self.action in ("list", "retrieve") else super().get_permissions()
    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(is_active=True) if not self.request.user.is_authenticated else queryset
    @action(detail=False, methods=["post"])
    def reorder(self, request):
        for item in request.data.get("items", []): GalleryItem.objects.filter(pk=item["id"]).update(display_order=item["display_order"])
        return Response(status=status.HTTP_204_NO_CONTENT)
class ProgressViewSet(ManagedViewSet): queryset = ConstructionProgress.objects.select_related("project").prefetch_related("images"); serializer_class = ConstructionProgressSerializer; filterset_fields = ("project", "is_published", "is_active"); search_fields = ("title", "description", "project__name")
class ProgressImageViewSet(ManagedViewSet):
    queryset = ProgressImage.objects.select_related("progress", "progress__project")
    serializer_class = ProgressImageSerializer
    filterset_fields = ("progress",)
    search_fields = ("alt_text", "progress__title", "progress__project__name")
