from pathlib import Path

from django.core.files.storage import FileSystemStorage, Storage
from storages.backends.s3 import S3Storage


IMAGE_EXTENSIONS = {
    ".avif", ".bmp", ".gif", ".heic", ".heif", ".jpeg", ".jpg",
    ".png", ".svg", ".tif", ".tiff", ".webp",
}


class ImageS3MediaStorage(Storage):
    """Store images in S3 and keep non-image uploads on the local media volume."""

    def __init__(self, **s3_options):
        self.s3 = S3Storage(**s3_options)
        self.local = FileSystemStorage()

    def _storage_for(self, name):
        return self.s3 if Path(name).suffix.lower() in IMAGE_EXTENSIONS else self.local

    def _open(self, name, mode="rb"):
        return self._storage_for(name).open(name, mode)

    def _save(self, name, content):
        return self._storage_for(name).save(name, content)

    def delete(self, name):
        return self._storage_for(name).delete(name)

    def exists(self, name):
        return self._storage_for(name).exists(name)

    def url(self, name):
        return self._storage_for(name).url(name)

    def size(self, name):
        return self._storage_for(name).size(name)

    def get_modified_time(self, name):
        return self._storage_for(name).get_modified_time(name)

