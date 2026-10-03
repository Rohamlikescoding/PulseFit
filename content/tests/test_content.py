import pytest

from content.models import FAQ, BlogCategory, SiteSettings
from content import models as content_models  # a bare "Testimonial" name would be collected by pytest (Test*)

pytestmark = pytest.mark.django_db


def test_faqs_only_active(api_client):
    FAQ.objects.create(question="Visible?", answer="Yes")
    FAQ.objects.create(question="Hidden?", answer="No", is_active=False)
    body = api_client.get("/api/v1/faqs/").json()
    assert [f["question"] for f in body] == ["Visible?"]


def test_testimonials_only_active(api_client):
    content_models.Testimonial.objects.create(name="Approved", text="...", is_active=True)
    content_models.Testimonial.objects.create(name="Draft", text="...")  # inactive by default
    body = api_client.get("/api/v1/testimonials/").json()
    assert [t["name"] for t in body] == ["Approved"]


def test_blog_categories_only_active(api_client):
    BlogCategory.objects.create(name="Nutrition", slug="nutrition")
    BlogCategory.objects.create(name="Draft", slug="draft", is_active=False)
    body = api_client.get("/api/v1/blog/categories/").json()
    assert [c["slug"] for c in body] == ["nutrition"]
    assert api_client.get("/api/v1/blog/categories/nutrition/").status_code == 200
    assert api_client.get("/api/v1/blog/categories/draft/").status_code == 404


@pytest.mark.usefixtures("redis_required")
def test_site_settings_defaults_and_cache_invalidation(api_client):
    from django.core.cache import cache
    from content.models import SITE_SETTINGS_CACHE_KEY

    cache.delete(SITE_SETTINGS_CACHE_KEY)
    assert api_client.get("/api/v1/site-settings/").json()["site_name"] == "Coach"

    settings_obj = SiteSettings.load()
    settings_obj.site_name = "My Gym"
    settings_obj.save()
    assert api_client.get("/api/v1/site-settings/").json()["site_name"] == "My Gym"
    cache.delete(SITE_SETTINGS_CACHE_KEY)


def test_site_settings_is_singleton():
    SiteSettings(site_name="A").save()
    SiteSettings(site_name="B").save()
    assert SiteSettings.objects.count() == 1
    assert SiteSettings.load().site_name == "B"
    with pytest.raises(ValueError):
        SiteSettings.load().delete()


def test_content_endpoints_are_public(api_client):
    for url in ["/api/v1/faqs/", "/api/v1/testimonials/", "/api/v1/site-settings/", "/api/v1/blog/categories/"]:
        assert api_client.get(url).status_code == 200, url
