from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError

from common.storage import IMAGE_EXTENSIONS


class Command(BaseCommand):
    help = "Copy existing files from MEDIA_ROOT into the configured default storage."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List files without uploading them.",
        )

    def handle(self, *args, **options):
        media_root = Path(settings.MEDIA_ROOT)
        if not settings.AWS_STORAGE_BUCKET_NAME:
            raise CommandError("AWS_STORAGE_BUCKET_NAME is not configured.")
        if not media_root.exists():
            raise CommandError(f"Local media directory does not exist: {media_root}")

        uploaded = skipped = 0
        files = sorted(
            path for path in media_root.rglob("*")
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )
        for path in files:
            name = path.relative_to(media_root).as_posix()
            if default_storage.exists(name):
                skipped += 1
                self.stdout.write(f"skip {name}")
                continue
            if options["dry_run"]:
                self.stdout.write(f"upload {name}")
                continue
            with path.open("rb") as source:
                default_storage.save(name, File(source, name=path.name))
            uploaded += 1
            self.stdout.write(self.style.SUCCESS(f"uploaded {name}"))

        action = "would upload" if options["dry_run"] else "uploaded"
        self.stdout.write(self.style.SUCCESS(
            f"Done: {action} {len(files) - skipped if options['dry_run'] else uploaded}, "
            f"skipped {skipped}."
        ))
