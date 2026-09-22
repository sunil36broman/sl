from django.db import migrations


def create_royel_club_sections(apps, schema_editor):
    ContentBlock = apps.get_model("content", "ContentBlock")
    offers = [
        ("Peak Fitness", "For lasting health, happiness and confidence."),
        ("Praava Health", "Health care anytime, anywhere."),
        ("Aura Wellness", "Personal care and wellbeing, thoughtfully delivered."),
        ("Long Beach Hotels", "Memorable stays and relaxing escapes."),
        ("Arcadia Home", "Selected pieces for considered interiors."),
        ("City Table", "Distinctive dining experiences for every occasion."),
    ]
    categories = ["Health Care", "Fitness", "Personal Care", "Hotel & Resort", "Building Materials", "Automobile", "Home Appliance", "Tours & Travel"]
    for index, (title, body) in enumerate(offers, 1):
        ContentBlock.objects.update_or_create(key=f"royel-offer-{index}", defaults={"block_type": "PROMOTION", "title": title, "body": body, "display_order": 100 + index, "is_published": True, "is_active": True})
    for index, title in enumerate(categories, 1):
        ContentBlock.objects.update_or_create(key=f"royel-category-{index}", defaults={"block_type": "PROMOTION", "title": title, "display_order": 120 + index, "is_published": True, "is_active": True})


class Migration(migrations.Migration):
    dependencies = [("content", "0009_home_meeting_section")]
    operations = [migrations.RunPython(create_royel_club_sections, migrations.RunPython.noop)]
