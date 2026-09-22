from django.db import migrations


def create_home_meeting_section(apps, schema_editor):
    ContentBlock = apps.get_model("content", "ContentBlock")
    ContentBlock.objects.update_or_create(
        key="home-meeting",
        defaults={
            "block_type": "CTA",
            "title": "Schedule a meeting",
            "body": "",
            "payload": {},
            "display_order": 30,
            "is_published": True,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [("content", "0008_alter_campaign_body")]
    operations = [
        migrations.RunPython(create_home_meeting_section, migrations.RunPython.noop),
    ]
