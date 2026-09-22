from rest_framework import serializers
from amenities.models import Amenity
from media_gallery.models import GalleryItem, ProgressImage
from properties.models import ApartmentType, Unit
from .models import ConstructionProgress, Project, PropertyType

class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta: model = PropertyType; fields = "__all__"; read_only_fields = ("created_by", "updated_by")

class AmenitySerializer(serializers.ModelSerializer):
    class Meta: model = Amenity; fields = "__all__"; read_only_fields = ("created_by", "updated_by")
class ApartmentTypeSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    class Meta:
        model = ApartmentType; fields = "__all__"; read_only_fields = ("created_by", "updated_by")
        extra_kwargs = {"project": {"required": False}}
class UnitSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    apartment_type_name = serializers.CharField(source="apartment_type.name", read_only=True)
    class Meta:
        model = Unit; fields = "__all__"; read_only_fields = ("created_by", "updated_by", "deleted_at")
        extra_kwargs = {"project": {"required": False}}
    def validate(self, attrs):
        apartment_type = attrs.get("apartment_type", getattr(self.instance, "apartment_type", None))
        project = attrs.get("project", getattr(self.instance, "project", None))
        if apartment_type and project and apartment_type.project_id != project.id:
            raise serializers.ValidationError({"apartment_type": "Apartment type must belong to the selected project."})
        return attrs
class GalleryItemSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    class Meta:
        model = GalleryItem; fields = "__all__"; read_only_fields = ("created_by", "updated_by")
        extra_kwargs = {"project": {"required": False}}
    def validate(self, attrs):
        if not attrs.get("image") and not attrs.get("url") and not getattr(self.instance, "image", None):
            raise serializers.ValidationError("An image or URL is required.")
        return attrs
class ProgressImageSerializer(serializers.ModelSerializer):
    progress_title = serializers.CharField(source="progress.title", read_only=True)
    project_name = serializers.CharField(source="progress.project.name", read_only=True)
    class Meta:
        model = ProgressImage; fields = "__all__"; read_only_fields = ("created_by", "updated_by")
class ConstructionProgressSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    images = ProgressImageSerializer(many=True, read_only=True)
    class Meta:
        model = ConstructionProgress; fields = "__all__"; read_only_fields = ("created_by", "updated_by")
        extra_kwargs = {"project": {"required": False}}
class ProjectListSerializer(serializers.ModelSerializer):
    area_name = serializers.CharField(source="area.name", read_only=True)
    property_type_name = serializers.CharField(source="property_type.name", read_only=True)
    property_type = serializers.SlugRelatedField(slug_field="name", queryset=PropertyType.objects.all())
    class Meta:
        model = Project
        fields = ("id", "name", "slug", "code", "short_description", "status", "property_type", "property_type_name", "area", "area_name", "min_apartment_size", "max_apartment_size", "min_price", "max_price", "currency", "expected_handover_date", "featured_image", "is_featured", "created_at")
class ProjectDetailSerializer(serializers.ModelSerializer):
    property_type_name = serializers.CharField(source="property_type.name", read_only=True)
    property_type = serializers.SlugRelatedField(slug_field="name", queryset=PropertyType.objects.all())
    amenities = serializers.PrimaryKeyRelatedField(many=True, queryset=Amenity.objects.all(), required=False)
    amenity_details = AmenitySerializer(source="amenities", many=True, read_only=True)
    apartment_types = ApartmentTypeSerializer(many=True, read_only=True)
    gallery_items = GalleryItemSerializer(many=True, read_only=True)
    progress_updates = ConstructionProgressSerializer(many=True, read_only=True)
    class Meta: model = Project; fields = "__all__"; read_only_fields = ("created_by", "updated_by", "deleted_at")
    def validate(self, attrs):
        division = attrs.get("division", getattr(self.instance, "division", None))
        district = attrs.get("district", getattr(self.instance, "district", None))
        area = attrs.get("area", getattr(self.instance, "area", None))
        if division and district and district.division_id != division.id:
            raise serializers.ValidationError({"district": "District does not belong to the selected division."})
        if district and area and area.district_id != district.id:
            raise serializers.ValidationError({"area": "Area does not belong to the selected district."})
        return attrs
