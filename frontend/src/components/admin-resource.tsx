"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { FormEvent, useEffect, useRef, useState } from "react";
import { adminData, adminFetch } from "@/lib/admin-api";
import { Icon } from "./icons";
type Row = Record<string, unknown> & { id?: string };
type Field = [string, string, string?, string[]?];
type Config = {
  title: string;
  description?: string;
  endpoint: string;
  columns: [string, string][];
  fields: Field[];
  singleton?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  filters?: Field[];
  fixedFilters?: Record<string, string>;
  excludeBlockTypes?: string[];
  allowedKeys?: string[];
  createdAtField?: string;
  ordering?: string;
};
const imageFields = new Set([
  "featured_image",
  "hero_banner",
  "features_image",
  "inquiry_image",
  "image",
  "desktop_image",
  "mobile_image",
  "customer_image",
  "video_thumbnail",
  "profile_image",
  "floor_plan",
  "icon",
  "logo",
  "favicon",
  "contact_hero_image",
  "contact_form_image",
  "campaign_image",
  "cover_image",
]);
const F = (
  key: string,
  label: string,
  type = "text",
  options?: string[],
): Field => [key, label, type, options];
export const resources: Record<string, Config> = {
  campaigns: {
    title: "Campaign announcements",
    description: "Schedule promotional announcements for the middle of the homepage. Only active campaigns within their start and end dates are displayed.",
    endpoint: "/campaigns/",
    columns: [["title", "Campaign"], ["start_date", "Starts"], ["end_date", "Ends"], ["is_active", "Active"]],
    fields: [
      F("title", "Campaign title"),
      F("body", "Short description (optional when an image is provided)", "textarea"),
      F("image", "Campaign image (optional when a description is provided)", "file"),
      F("cta_label", "Button label (optional)"),
      F("cta_url", "Button URL (optional)"),
      F("start_date", "Start date", "datetime-local"),
      F("end_date", "End date", "datetime-local"),
      F("display_order", "Display priority", "number"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  projects: {
    title: "Projects",
    endpoint: "/projects/",
    columns: [
      ["name", "Project"],
      ["code", "Code"],
      ["property_type", "Type"],
      ["status", "Status"],
      ["publication_status", "Publishing"],
    ],
    fields: [
      F("name", "Name"),
      F("slug", "Slug"),
      F("code", "Code"),
      F("short_description", "Short description", "textarea"),
      F("description", "Description", "textarea"),
      F("property_type", "Property type", "property-type-select"),
      F("status", "Status", "select", [
        "UPCOMING",
        "ONGOING",
        "READY",
        "HANDED_OVER",
      ]),
      F("publication_status", "Publishing", "select", [
        "DRAFT",
        "PUBLISHED",
        "ARCHIVED",
      ]),
      F("division", "Division", "division-select"),
      F("district", "District", "district-select"),
      F("area", "Area", "area-select"),
      F("amenities", "Amenities", "amenities-select"),
      F("address", "Address", "textarea"),
      F("google_maps_url", "Google Maps URL"),
      F("latitude", "Latitude", "number"),
      F("longitude", "Longitude", "number"),
      F("land_size", "Land size", "number"),
      F("road_width", "Road width", "number"),
      F("buildings", "Buildings", "number"),
      F("floors", "Floors", "number"),
      F("basements", "Basements", "number"),
      F("apartment_count", "Apartment count", "number"),
      F("apartments_per_floor", "Apartments per floor", "number"),
      F("min_apartment_size", "Minimum apartment size", "number"),
      F("max_apartment_size", "Maximum apartment size", "number"),
      F("min_price", "Minimum price", "number"),
      F("max_price", "Maximum price", "number"),
      F("currency", "Currency"),
      F("construction_start_date", "Construction start", "date"),
      F("expected_handover_date", "Expected handover", "date"),
      F("actual_handover_date", "Actual handover", "date"),
      F("featured_image", "Featured image", "file"),
      F("hero_banner", "Hero banner", "file"),
      F("features_label", "Features section label"),
      F("features_title", "Features section title"),
      F("features_image", "Features section image", "file"),
      F("inquiry_title", "Property enquiry title"),
      F("inquiry_description", "Property enquiry description", "textarea"),
      F("inquiry_image", "Property enquiry image", "file"),
      F("brochure", "Brochure PDF", "file"),
      F("video_url", "Video URL"),
      F("virtual_tour_url", "Virtual tour URL"),
      F("display_order", "Display order", "number"),
      F("is_featured", "Featured", "checkbox"),
      F("is_active", "Active", "checkbox"),
      F("seo_title", "SEO title"),
      F("seo_description", "SEO description", "textarea"),
      F("seo_keywords", "SEO keywords", "textarea"),
    ],
  },
  "property-types": {
    title: "Property types",
    endpoint: "/property-types/",
    columns: [
      ["name", "Property type"],
      ["slug", "Slug"],
      ["is_active", "Active"],
    ],
    fields: [
      F("name", "Name"),
      F("slug", "Slug"),
      F("description", "Description", "textarea"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  divisions: {
    title: "Divisions",
    endpoint: "/divisions/",
    columns: [
      ["name", "Division"],
      ["is_active", "Active"],
    ],
    fields: [F("name", "Name"), F("is_active", "Active", "checkbox")],
  },
  districts: {
    title: "Districts",
    endpoint: "/districts/",
    columns: [
      ["name", "District"],
      ["division_name", "Division"],
      ["is_active", "Active"],
    ],
    fields: [
      F("division", "Division", "division-select"),
      F("name", "Name"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  areas: {
    title: "Areas",
    endpoint: "/areas/",
    columns: [
      ["name", "Area"],
      ["district_name", "District"],
      ["is_active", "Active"],
    ],
    fields: [
      F("district", "District", "district-select"),
      F("name", "Name"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  "apartment-types": {
    title: "Apartment types",
    endpoint: "/apartment-types/",
    columns: [
      ["name", "Type"],
      ["project_name", "Project"],
      ["size_sqft", "Size"],
      ["bedrooms", "Bedrooms"],
    ],
    fields: [
      F("project", "Project", "project-select"),
      F("name", "Name"),
      F("size_sqft", "Size (sq ft)", "number"),
      F("bedrooms", "Bedrooms", "number"),
      F("bathrooms", "Bathrooms", "number"),
      F("balconies", "Balconies", "number"),
      F("has_drawing_room", "Drawing room", "checkbox"),
      F("has_dining_room", "Dining room", "checkbox"),
      F("has_kitchen", "Kitchen", "checkbox"),
      F("has_servant_room", "Servant room", "checkbox"),
      F("parking_allocation", "Parking allocation", "number"),
      F("facing", "Facing"),
      F("floor_plan", "Floor plan", "file"),
      F("starting_price", "Starting price", "number"),
      F("description", "Description", "textarea"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  units: {
    title: "Units",
    endpoint: "/units/",
    columns: [
      ["unit_number", "Unit"],
      ["project_name", "Project"],
      ["apartment_type_name", "Apartment type"],
      ["floor_number", "Floor"],
      ["size_sqft", "Size"],
      ["price", "Price"],
      ["availability", "Availability"],
    ],
    fields: [
      F("project", "Project", "project-select"),
      F("apartment_type", "Apartment type", "apartment-type-select"),
      F("building", "Building"),
      F("unit_number", "Unit number"),
      F("floor_number", "Floor", "number"),
      F("size_sqft", "Size", "number"),
      F("price", "Price", "number"),
      F("booking_amount", "Booking amount", "number"),
      F("availability", "Availability", "select", [
        "AVAILABLE",
        "RESERVED",
        "BOOKED",
        "SOLD",
        "UNAVAILABLE",
      ]),
      F("parking_number", "Parking number"),
      F("handover_status", "Handover status"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  inquiries: {
    title: "Enquiries",
    endpoint: "/inquiries/",
    filters: [F("status", "All statuses", "select", ["NEW", "CONTACTED", "QUALIFIED", "SITE_VISIT", "NEGOTIATION", "CONVERTED", "LOST", "CLOSED"])],
    columns: [
      ["full_name", "Customer"],
      ["phone", "Phone"],
      ["email", "Email"],
      ["lead_source", "Source"],
      ["status", "Status"],
    ],
    fields: [
      F("full_name", "Customer name"),
      F("phone", "Phone"),
      F("email", "Email", "email"),
      F("project", "Project ID"),
      F("preferred_location", "Preferred location"),
      F("expected_budget", "Budget", "number"),
      F("preferred_contact_method", "Contact method"),
      F("lead_source", "Lead source"),
      F("message", "Message", "textarea"),
      F("status", "Status", "select", [
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "SITE_VISIT",
        "NEGOTIATION",
        "CONVERTED",
        "LOST",
        "CLOSED",
      ]),
      F("internal_notes", "Internal notes", "textarea"),
    ],
  },
  meetings: {
    title: "Meetings",
    endpoint: "/meeting-requests/",
    filters: [F("status", "All statuses", "select", ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]), F("meeting_type", "All meeting types", "select", ["OFFICE", "SITE_VISIT", "ONLINE"])],
    columns: [
      ["customer_name", "Customer"],
      ["meeting_type", "Type"],
      ["preferred_date", "Date"],
      ["preferred_time", "Time"],
      ["status", "Status"],
    ],
    fields: [
      F("customer_name", "Customer"),
      F("phone", "Phone"),
      F("email", "Email", "email"),
      F("project", "Project ID"),
      F("meeting_type", "Meeting type"),
      F("preferred_date", "Date", "date"),
      F("preferred_time", "Time", "time"),
      F("message", "Message", "textarea"),
      F("status", "Status", "select", [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
      ]),
    ],
  },
  messages: {
    title: "Messages",
    endpoint: "/contact-messages/",
    filters: [F("user_type", "All user types", "select", ["CLIENT", "LANDOWNER"]), F("is_resolved", "Resolution", "select", ["true", "false"])],
    columns: [
      ["full_name", "Customer"],
      ["user_type", "User type"],
      ["email", "Email"],
      ["phone", "Phone"],
      ["subject", "Subject"],
      ["is_resolved", "Resolved"],
    ],
    fields: [
      F("full_name", "Customer"),
      F("user_type", "User type", "select", ["CLIENT", "LANDOWNER"]),
      F("phone", "Phone"),
      F("email", "Email", "email"),
      F("subject", "Subject"),
      F("message", "Message", "textarea"),
      F("is_resolved", "Resolved", "checkbox"),
    ],
  },
  "page-headers": {
    title: "Page headers",
    description:
      "Choose a page and click Edit. You can change its heading, small label, subtitle, and background image. Homepage banners are under Homepage sliders; the Contact Us page is under Site settings.",
    endpoint: "/content-blocks/",
    fixedFilters: { block_type: "HEADER" },
    canCreate: false,
    canDelete: false,
    columns: [
      ["key", "Page"],
      ["title", "Main heading"],
      ["is_published", "Visible"],
    ],
    fields: [
      F("payload", "Small label above the heading", "header-label"),
      F("title", "Main heading"),
      F("body", "Subtitle / supporting text", "textarea"),
      F("image", "Header background image", "file"),
      F("is_published", "Show this header", "checkbox"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  "homepage-content": {
    title: "Homepage content",
    description: "Edit the main sections shown below the homepage banner. Banners are managed under Homepage sliders.",
    endpoint: "/content-blocks/", canCreate: false, canDelete: false,
    allowedKeys: ["our-story", "home-featured-projects", "home-testimonials", "private-conversation", "home-meeting"],
    columns: [["key", "Homepage section"], ["title", "Heading"], ["is_published", "Visible"]],
    fields: [F("payload", "Small label and supporting settings", "content-settings"), F("title", "Section heading"), F("body", "Section description", "textarea"), F("image", "Section image", "file"), F("is_published", "Show on homepage", "checkbox"), F("is_active", "Active", "checkbox")],
  },
  content: {
    title: "Page sections",
    description: "Manage the headings, descriptions, images, labels, and supporting details used inside website pages. Page banners are managed separately under Page headers.",
    endpoint: "/content-blocks/",
    excludeBlockTypes: ["HEADER"],
    columns: [
      ["key", "Website section"],
      ["title", "Heading"],
      ["block_type", "Content category"],
      ["is_published", "Visible"],
    ],
    fields: [
      F("block_type", "Content category", "select", [
        "ABOUT",
        "ACHIEVEMENT",
        "STATISTIC",
        "PROMOTION",
        "BUYER",
        "LANDOWNER",
        "CTA",
        "HEADER",
        "FOOTER",
        "PRIVACY",
        "TERMS",
      ]),
      F("key", "Internal identifier (lowercase words with hyphens)"),
      F("title", "Section heading"),
      F("body", "Section description", "textarea"),
      F("image", "Section image", "file"),
      F("payload", "Additional section details", "content-settings"),
      F("display_order", "Display order", "number"),
      F("is_published", "Show on website", "checkbox"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  blogs: {
    title: "Blog posts",
    endpoint: "/blogs/",
    columns: [
      ["title", "Title"],
      ["category_name", "Category"],
      ["tag_names", "Tags"],
      ["is_published", "Published"],
      ["published_at", "Published at"],
    ],
    fields: [
      F("title", "Title"),
      F("slug", "Slug"),
      F("excerpt", "Excerpt", "textarea"),
      F("content", "Article", "textarea"),
      F("category", "Category", "category-select"),
      F("tags", "Tags", "tags-select"),
      F("featured_image", "Image", "file"),
      F("published_at", "Publish date", "datetime-local"),
      F("is_featured", "Featured", "checkbox"),
      F("is_published", "Published", "checkbox"),
      F("seo_title", "SEO title"),
      F("seo_description", "SEO description", "textarea"),
    ],
  },
  "team-members": {
    title: "Team members",
    endpoint: "/team-members/",
    columns: [["full_name", "Name"], ["designation", "Designation"], ["department", "Department"], ["is_active", "Visible"]],
    fields: [
      F("full_name", "Full name"), F("designation", "Designation"), F("department", "Department"),
      F("biography", "Biography", "textarea"), F("profile_image", "Profile photo", "file"),
      F("email", "Email", "email"), F("phone", "Phone"), F("linkedin_url", "LinkedIn URL"),
      F("display_order", "Display order", "number"), F("is_active", "Show on website", "checkbox"),
    ],
  },
  "newsletter-issues": {
    title: "Newsletter issues",
    endpoint: "/newsletter-issues/",
    columns: [["title", "Title"], ["issue_number", "Issue"], ["publication_date", "Published"], ["is_active", "Visible"]],
    fields: [
      F("title", "Newsletter title"), F("issue_number", "Issue number"),
      F("publication_date", "Publication date", "date"), F("cover_image", "Cover image", "file"),
      F("pdf", "Newsletter PDF", "file"), F("display_order", "Display order", "number"),
      F("is_active", "Show on website", "checkbox"),
    ],
  },
  "blog-categories": {
    title: "Blog categories",
    endpoint: "/blog-categories/",
    columns: [
      ["name", "Category"],
      ["slug", "Slug"],
      ["is_active", "Active"],
    ],
    fields: [
      F("name", "Name"),
      F("slug", "Slug"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  "blog-tags": {
    title: "Blog tags",
    endpoint: "/blog-tags/",
    columns: [
      ["name", "Tag"],
      ["slug", "Slug"],
      ["is_active", "Active"],
    ],
    fields: [
      F("name", "Name"),
      F("slug", "Slug"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  jobs: {
    title: "Careers",
    endpoint: "/jobs/",
    columns: [
      ["title", "Position"],
      ["department", "Department"],
      ["location", "Location"],
      ["job_type", "Type"],
      ["application_deadline", "Deadline"],
    ],
    fields: [
      F("title", "Title"),
      F("slug", "Slug"),
      F("department", "Department"),
      F("location", "Location"),
      F("job_type", "Type", "select", [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
      ]),
      F("vacancy_count", "Vacancies", "number"),
      F("required_experience", "Experience"),
      F("educational_requirements", "Education", "textarea"),
      F("responsibilities", "Responsibilities", "textarea"),
      F("description", "Description", "textarea"),
      F("salary_range", "Salary range"),
      F("application_deadline", "Deadline", "date"),
      F("is_published", "Published", "checkbox"),
    ],
  },
  settings: {
    title: "Site settings",
    endpoint: "/settings/",
    singleton: true,
    columns: [
      ["company_name", "Company"],
      ["email", "Email"],
      ["hotline", "Hotline"],
      ["office_address", "Address"],
    ],
    fields: [
      F("_general_settings", "General website settings", "section"),
      F("company_name", "Company"),
      F("logo", "Logo", "file"),
      F("favicon", "Favicon", "file"),
      F("hotline", "Top menu contact number / hotline"),
      F("email", "Email", "email"),
      F("office_address", "Address", "textarea"),
      F("google_maps_url", "Map share link (opens View larger map)"),
      F("business_hours", "Business hours"),
      F("_social_links", "Social media links", "section"),
      F("social_links", "Social profiles", "social-links"),
      F("_contact_hero", "Contact Us page — Hero banner", "section"),
      F("contact_hero_label", "Small text above hero title"),
      F("contact_hero_title", "Hero main title"),
      F("contact_hero_image", "Hero background image", "file"),
      F("_contact_details", "Contact Us page — Contact details and map", "section"),
      F("contact_details_label", "Small text above contact-details title"),
      F("contact_details_title", "Contact-details title"),
      F("contact_map_embed_url", "Optional Google Maps embed URL (not a short share link)"),
      F("contact_map_button_label", "Map button label"),
      F("_contact_image", "Contact Us page — Left image panel", "section"),
      F("contact_image_label", "Text shown over left image"),
      F("contact_image_title", "Title shown over left image"),
      F("contact_form_image", "Left panel background image", "file"),
      F("_contact_form", "Contact Us page — Form heading", "section"),
      F("contact_form_label", "Small text above form title"),
      F("contact_form_title", "Form main title"),
      F("contact_name_label", "Name field label"),
      F("contact_phone_label", "Phone field label"),
      F("contact_email_label", "Email field label"),
      F("contact_user_type_label", "User type label"),
      F("contact_client_label", "Client option label"),
      F("contact_landowner_label", "Landowner option label"),
      F("contact_message_label", "Message field label"),
      F("contact_submit_label", "Submit button label"),
      F("_footer_seo", "Footer and SEO", "section"),
      F("footer_content", "Footer brand description", "textarea"),
      F("footer_explore_title", "Navigation section heading"),
      F("footer_contact_title", "Contact section heading"),
      F("footer_link_1_label", "Link 1 label"),
      F("footer_link_1_url", "Link 1 URL"),
      F("footer_link_2_label", "Link 2 label"),
      F("footer_link_2_url", "Link 2 URL"),
      F("footer_link_3_label", "Link 3 label"),
      F("footer_link_3_url", "Link 3 URL"),
      F("footer_link_4_label", "Link 4 label"),
      F("footer_link_4_url", "Link 4 URL"),
      F("footer_copyright_text", "Copyright text"),
      F("default_seo_title", "SEO title"),
      F("default_seo_description", "SEO description", "textarea"),
      F("google_analytics_id", "Analytics ID"),
    ],
  },
  users: {
    title: "Users & roles",
    endpoint: "/auth/users/",
    createdAtField: "date_joined",
    ordering: "-date_joined",
    columns: [
      ["email", "Email"],
      ["first_name", "First name"],
      ["last_name", "Last name"],
      ["role", "Role"],
      ["is_active", "Active"],
    ],
    fields: [
      F("email", "Email", "email"),
      F("username", "Username"),
      F("first_name", "First name"),
      F("last_name", "Last name"),
      F("phone", "Phone"),
      F("role", "Role", "select", [
        "SUPER_ADMIN",
        "CONTENT_ADMIN",
        "PROJECT_MANAGER",
        "SALES_OFFICER",
        "SUPPORT_OFFICER",
      ]),
      F("password", "Password", "password"),
      F("is_active", "Active", "checkbox"),
      F("is_staff", "Staff access", "checkbox"),
    ],
  },
  amenities: {
    title: "Amenities",
    endpoint: "/amenities/",
    columns: [
      ["name", "Name"],
      ["icon", "Icon"],
      ["is_active", "Active"],
    ],
    fields: [
      F("name", "Name"),
      F("icon", "Icon", "file"),
      F("description", "Description", "textarea"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  locations: {
    title: "Areas",
    endpoint: "/areas/",
    columns: [
      ["name", "Area"],
      ["district", "District ID"],
      ["is_active", "Active"],
    ],
    fields: [
      F("district", "District ID"),
      F("name", "Name"),
      F("slug", "Slug"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  gallery: {
    title: "Media gallery",
    endpoint: "/gallery/",
    columns: [
      ["caption", "Caption"],
      ["project_name", "Project"],
      ["kind", "Type"],
      ["display_order", "Order"],
    ],
    fields: [
      F("project", "Project", "project-select"),
      F("kind", "Type", "select", [
        "EXTERIOR",
        "INTERIOR",
        "CONSTRUCTION",
        "ARCHITECTURAL",
        "FLOOR_PLAN",
        "VIDEO",
        "VIRTUAL_TOUR",
      ]),
      F("image", "Image", "file"),
      F("url", "External URL"),
      F("caption", "Caption"),
      F("alt_text", "Alternative text"),
      F("display_order", "Order", "number"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  progress: {
    title: "Construction progress",
    endpoint: "/progress/",
    columns: [
      ["title", "Title"],
      ["project_name", "Project"],
      ["progress_date", "Date"],
      ["completion_percentage", "Progress"],
    ],
    fields: [
      F("project", "Project", "project-select"),
      F("title", "Title"),
      F("description", "Description", "textarea"),
      F("progress_date", "Date", "date"),
      F("completion_percentage", "Completion percentage", "number"),
      F("video_url", "Video URL"),
      F("is_published", "Published", "checkbox"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  "progress-images": {
    title: "Construction progress images",
    description: "Upload photographs for construction progress updates. Images are stored in S3.",
    endpoint: "/progress-images/",
    columns: [["project_name", "Project"], ["progress_title", "Progress update"], ["alt_text", "Alternative text"]],
    fields: [
      F("progress", "Progress update", "progress-select"),
      F("image", "Progress image", "file"),
      F("alt_text", "Alternative text"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  sliders: {
    title: "Homepage sliders",
    endpoint: "/sliders/",
    columns: [
      ["title", "Title"],
      ["display_order", "Order"],
      ["is_active", "Active"],
    ],
    fields: [
      F("title", "Title"),
      F("subtitle", "Subtitle"),
      F("desktop_image", "Desktop image", "file"),
      F("mobile_image", "Mobile image", "file"),
      F("button_label", "Button label"),
      F("button_url", "Button URL"),
      F("video_url", "YouTube or video URL"),
      F("google_maps_url", "Google Maps URL"),
      F("start_date", "Start date", "datetime-local"),
      F("end_date", "End date", "datetime-local"),
      F("display_order", "Order", "number"),
      F("is_active", "Active", "checkbox"),
    ],
  },
  testimonials: {
    title: "Testimonials",
    endpoint: "/testimonials/",
    columns: [
      ["customer_name", "Customer"],
      ["customer_type", "Customer type"],
      ["rating", "Rating"],
      ["is_published", "Published"],
    ],
    fields: [
      F("customer_name", "Customer name"),
      F("customer_type", "Customer type"),
      F("project", "Project", "project-select"),
      F("title", "Title"),
      F("description", "Testimonial", "textarea"),
      F("customer_image", "Customer photo", "file"),
      F("video_url", "Video URL"),
      F("video_thumbnail", "Video thumbnail image", "file"),
      F("rating", "Rating", "number"),
      F("is_featured", "Featured", "checkbox"),
      F("display_order", "Order", "number"),
      F("is_published", "Published", "checkbox"),
    ],
  },
  applications: {
    title: "Job applications",
    endpoint: "/job-applications/",
    canCreate: false,
    canDelete: false,
    columns: [
      ["applicant_name", "Applicant"],
      ["email", "Email"],
      ["years_of_experience", "Experience"],
      ["status", "Status"],
    ],
    fields: [
      F("job", "Job ID"),
      F("applicant_name", "Applicant name"),
      F("email", "Email", "email"),
      F("phone", "Phone"),
      F("years_of_experience", "Years of experience"),
      F("previous_organization", "Previous organization"),
      F("education_degree", "Education degree"),
      F("education_institution", "Education institution"),
      F("cover_letter", "Cover letter", "textarea"),
      F("cv", "CV", "file"),
      F("status", "Status", "select", [
        "RECEIVED",
        "REVIEWING",
        "SHORTLISTED",
        "REJECTED",
        "HIRED",
      ]),
      F("internal_notes", "Internal notes", "textarea"),
    ],
  },
  landowners: {
    title: "Landowner proposals",
    endpoint: "/landowner-proposals/",
    filters: [F("status", "All statuses", "select", ["NEW", "REVIEWING", "CONTACTED", "APPROVED", "REJECTED", "CLOSED"])],
    columns: [
      ["owner_name", "Owner"],
      ["phone", "Phone"],
      ["land_address", "Location"],
      ["status", "Status"],
    ],
    fields: [
      F("owner_name", "Owner name"),
      F("phone", "Phone"),
      F("email", "Email", "email"),
      F("land_address", "Land address", "textarea"),
      F("division", "Division", "division-select"),
      F("district", "District", "district-select"),
      F("area", "Area", "area-select"),
      F("land_size", "Land size"),
      F("road_width", "Road width"),
      F("ownership_type", "Ownership type"),
      F("number_of_owners", "Number of owners", "number"),
      F("google_maps_url", "Google Maps URL"),
      F("message", "Message", "textarea"),
      F("internal_notes", "Internal notes", "textarea"),
      F("status", "Status", "select", [
        "NEW",
        "REVIEWING",
        "CONTACTED",
        "APPROVED",
        "REJECTED",
        "CLOSED",
      ]),
    ],
  },
};
export function AdminResource({ name }: { name: string }) {
  const config = resources[name];
  const [rows, setRows] = useState<Row[]>([]),
    [loading, setLoading] = useState(true),
    [query, setQuery] = useState(""),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(12),
    [total, setTotal] = useState(0),
    [error, setError] = useState(""),
    [editing, setEditing] = useState<Row | null>(null),
    [open, setOpen] = useState(false);
  const createdAtField = config?.createdAtField || "created_at";
  const tableColumns: [string, string][] = config
    ? config.columns.some(([key]) => key === createdAtField)
      ? config.columns
      : [...config.columns, [createdAtField, "Created Date"]]
    : [];
  async function load() {
    if (!config) return;
    setLoading(true);
    try {
      if (config.singleton) {
        const r = await adminFetch(config.endpoint),
          b = await r.json();
        if (!r.ok) throw Error();
        setRows([b.data || b]);
        setTotal(1);
      } else {
        const clientFiltered=Boolean(config.excludeBlockTypes?.length||config.allowedKeys?.length);
        const params = new URLSearchParams({page_size: clientFiltered?"100":String(pageSize), search: query, ordering: config.ordering || `-${createdAtField}`});
        if(!clientFiltered)params.set("page",String(page));
        Object.entries(config.fixedFilters || {}).forEach(([key, value]) => params.set(key, value));
        Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
        const result=await adminData<Row>(`${config.endpoint}?${params.toString()}`),items=result.items;
        let visible=items;
        if(config.excludeBlockTypes?.length)visible=visible.filter(item=>!config.excludeBlockTypes!.includes(String(item.block_type)));
        if(config.allowedKeys?.length)visible=visible.filter(item=>config.allowedKeys!.includes(String(item.key)));
        setTotal(clientFiltered?visible.length:result.count);
        setRows(clientFiltered?visible.slice((page-1)*pageSize,page*pageSize):visible);
      }
      setError("");
    } catch {
      setError("You do not have permission for this module.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => void load(), 300);
    return () => clearTimeout(timer);
  }, [name, query, filters, page, pageSize]);
  useEffect(() => setPage(1), [name]);
  if (!config) return <div className="admin-panel">Unknown module.</div>;
  async function edit(row: Row) {
    if (row.id && !config.singleton) {
      const r = await adminFetch(`${config.endpoint}${row.id}/`),
        b = await r.json();
      setEditing(b.data || b);
    } else setEditing(row);
    setOpen(true);
  }
  async function remove(id?: string) {
    if (id && confirm("Delete this record permanently?")) {
      const r = await adminFetch(`${config.endpoint}${id}/`, {
        method: "DELETE",
      });
      if (r.ok) void load();
      else alert("Delete failed");
    }
  }
  return (
    <>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Management</p>
          <h1 className="mt-3 font-serif text-4xl">{config.title}</h1>
          {config.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-stone">{config.description}</p>}
        </div>
        {!config.singleton && config.canCreate !== false && (
          <button
            className="admin-button"
            onClick={() => {
              setEditing({});
              setOpen(true);
            }}
          >
            + Add new
          </button>
        )}
      </div>
      <section className="admin-panel mt-8 overflow-hidden p-0!">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
          className="admin-filter-toolbar m-5"
        >
          <div className="relative min-w-56 flex-1"><Icon name="search" className="absolute left-3 top-3 h-4 w-4" /><input value={query} onChange={(e) => {setQuery(e.target.value);setPage(1)}} className="h-10 pl-10!" placeholder="Search" /></div>
          {config.filters?.map(([key, label, , options]) => <select key={key} aria-label={label} value={filters[key] || ""} onChange={(e) => {setFilters((current) => ({...current, [key]: e.target.value}));setPage(1)}} className="h-10 min-w-40"><option value="">{label}</option>{options?.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select>)}
          {(query || Object.values(filters).some(Boolean)) && <button type="button" className="px-3 text-xs underline" onClick={() => {setQuery(""); setFilters({});setPage(1)}}>Clear</button>}
        </form>
        {loading ? (
          <Msg t="Loading…" />
        ) : error ? (
          <Msg t={error} />
        ) : !rows.length ? (
          <Msg t="No records yet." />
        ) : (
          <div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  {tableColumns.map((x) => (
                    <th key={x[0]}>{x[1]}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id || i}>
                    {tableColumns.map((x) => (
                      <td key={x[0]}>
                        {name === "page-headers" && x[0] === "key"
                          ? pageHeaderName(String(r[x[0]] || ""))
                          : name === "homepage-content" && x[0] === "key"
                            ? contentSectionName(String(r[x[0]] || ""))
                          : name === "content" && x[0] === "key"
                            ? contentSectionName(String(r[x[0]] || ""))
                          : name === "content" && x[0] === "block_type"
                            ? contentTypeName(String(r[x[0]] || ""))
                          : x[0] === createdAtField
                            ? fmtDateTime(r[x[0]])
                            : fmt(r[x[0]])}
                      </td>
                    ))}
                    <td>
                      <button
                        onClick={() => edit(r)}
                        className="mr-4 text-xs text-forest underline"
                      >
                        Edit
                      </button>
                    {!config.singleton && config.canDelete !== false && (
                        <button
                          onClick={() => remove(r.id)}
                          className="text-xs text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!config.singleton&&total>0&&<AdminPagination page={page} pageSize={pageSize} total={total} onPage={setPage} onPageSize={(size)=>{setPageSize(size);setPage(1)}}/>}
          </div>
        )}
      </section>
      {open && (
        <Editor
          config={config}
          value={editing || {}}
          close={() => setOpen(false)}
          saved={() => {
            setOpen(false);
            void load();
          }}
        />
      )}
    </>
  );
}
function AdminPagination({page,pageSize,total,onPage,onPageSize}:{page:number;pageSize:number;total:number;onPage:(page:number)=>void;onPageSize:(size:number)=>void}){
  const totalPages=Math.max(1,Math.ceil(total/pageSize)),start=Math.max(1,Math.min(page-2,totalPages-4)),end=Math.min(totalPages,start+4),pages=Array.from({length:end-start+1},(_,index)=>start+index),first=(page-1)*pageSize+1,last=Math.min(page*pageSize,total);
  return <div className="flex flex-col gap-3 border-t border-black/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3 text-xs text-stone"><span>Showing {first}–{last} of {total}</span><label className="flex items-center gap-2">Rows<select className="h-8 min-w-16" value={pageSize} onChange={event=>onPageSize(Number(event.target.value))}>{[12,25,50,100].map(size=><option key={size} value={size}>{size}</option>)}</select></label></div><nav className="flex items-center gap-1" aria-label="Table pagination"><button type="button" className="h-8 px-3 text-xs disabled:opacity-35" disabled={page<=1} onClick={()=>onPage(page-1)}>Previous</button>{pages.map(number=><button type="button" key={number} aria-current={number===page?"page":undefined} className={`grid h-8 min-w-8 place-items-center border text-xs ${number===page?"border-forest bg-forest text-white":"border-black/10"}`} onClick={()=>onPage(number)}>{number}</button>)}<button type="button" className="h-8 px-3 text-xs disabled:opacity-35" disabled={page>=totalPages} onClick={()=>onPage(page+1)}>Next</button></nav></div>
}
function Editor({
  config,
  value,
  close,
  saved,
}: {
  config: Config;
  value: Row;
  close: () => void;
  saved: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [projects, setProjects] = useState<Row[]>([]),
    [progressUpdates, setProgressUpdates] = useState<Row[]>([]),
    [categories, setCategories] = useState<Row[]>([]),
    [tags, setTags] = useState<Row[]>([]),
    [divisions, setDivisions] = useState<Row[]>([]),
    [districts, setDistricts] = useState<Row[]>([]),
    [areas, setAreas] = useState<Row[]>([]),
    [amenities, setAmenities] = useState<Row[]>([]),
    [selectedAmenities, setSelectedAmenities] = useState<string[]>(() =>
      relationIds(value.amenities),
    ),
    [featureName, setFeatureName] = useState(""),
    [addingFeature, setAddingFeature] = useState(false),
    [apartmentTypes, setApartmentTypes] = useState<Row[]>([]),
    [propertyTypes, setPropertyTypes] = useState<Row[]>([]);
  useEffect(() => {
    if (config.fields.some((field) => field[2] === "project-select"))
      adminData<Row>("/projects/?page_size=100")
        .then((result) => setProjects(result.items))
        .catch(() => setProjects([]));
    if (config.fields.some((field) => field[2] === "progress-select"))
      adminData<Row>("/progress/?page_size=100")
        .then((result) => setProgressUpdates(result.items))
        .catch(() => setProgressUpdates([]));
    if (config.fields.some((field) => field[2] === "category-select"))
      adminData<Row>("/blog-categories/?page_size=100")
        .then((result) => setCategories(result.items))
        .catch(() => setCategories([]));
    if (config.fields.some((field) => field[2] === "tags-select"))
      adminData<Row>("/blog-tags/?page_size=100")
        .then((result) => setTags(result.items))
        .catch(() => setTags([]));
    if (config.fields.some((field) => field[2] === "division-select"))
      adminData<Row>("/divisions/?page_size=100")
        .then((result) => setDivisions(result.items))
        .catch(() => setDivisions([]));
    if (config.fields.some((field) => field[2] === "district-select"))
      adminData<Row>("/districts/?page_size=100")
        .then((result) => setDistricts(result.items))
        .catch(() => setDistricts([]));
    if (config.fields.some((field) => field[2] === "area-select"))
      adminData<Row>("/areas/?page_size=100")
        .then((result) => setAreas(result.items))
        .catch(() => setAreas([]));
    if (config.fields.some((field) => field[2] === "amenities-select"))
      adminData<Row>("/amenities/?page_size=100")
        .then((result) => setAmenities(result.items))
        .catch(() => setAmenities([]));
    if (config.fields.some((field) => field[2] === "apartment-type-select"))
      adminData<Row>("/apartment-types/?page_size=100")
        .then((result) => setApartmentTypes(result.items))
        .catch(() => setApartmentTypes([]));
    if (config.fields.some((field) => field[2] === "property-type-select"))
      adminData<Row>("/property-types/?page_size=100")
        .then((result) => setPropertyTypes(result.items))
        .catch(() => setPropertyTypes([]));
  }, [config]);
  async function createFeature() {
    const name = featureName.trim();
    if (!name) return;
    setAddingFeature(true);
    setError("");
    const data = new FormData();
    data.set("name", name);
    data.set("is_active", "true");
    const response = await adminFetch("/amenities/", {
      method: "POST",
      body: data,
    });
    if (response.ok) {
      const body = await response.json();
      const feature = (body.data || body) as Row;
      const id = String(feature.id);
      setAmenities((items) => [...items, feature]);
      setSelectedAmenities((items) => [...items, id]);
      setFeatureName("");
    } else {
      setError(
        JSON.stringify(
          await response.json().catch(() => ({
            message: "Unable to create feature",
          })),
        ),
      );
    }
    setAddingFeature(false);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const data = new FormData(e.currentTarget);
    if (config.fields.some(([, , type]) => type === "header-label")) {
      const currentPayload =
        value.payload && typeof value.payload === "object" && !Array.isArray(value.payload)
          ? (value.payload as Record<string, unknown>)
          : {};
      const label = String(data.get("header_label") || "").trim();
      data.delete("header_label");
      data.set("payload", JSON.stringify({ ...currentPayload, label }));
    }
    if (config.fields.some(([, , type]) => type === "content-settings")) {
      const currentPayload = value.payload && typeof value.payload === "object" && !Array.isArray(value.payload) ? value.payload as Record<string, unknown> : {};
      const payload: Record<string, unknown> = {...currentPayload};
      const textFields=["label","video_url","role","bio","benefits_title","image_label","image_title"];
      for(const field of textFields){const formKey=`content_${field}`,raw=String(data.get(formKey)||"").trim();data.delete(formKey);if(raw)payload[field]=raw;else delete payload[field]}
      for(const field of ["items","benefits"]){const formKey=`content_${field}`,items=String(data.get(formKey)||"").split("\n").map(item=>item.trim()).filter(Boolean);data.delete(formKey);if(items.length)payload[field]=items;else delete payload[field]}
      data.set("payload",JSON.stringify(payload));
    }
    if (config.fields.some(([key]) => key === "social_links")) {
      const socialLinks = Object.fromEntries(
        ["facebook", "linkedin", "instagram", "youtube", "whatsapp"]
          .map((name) => [name, String(data.get(`social_${name}`) || "").trim()])
          .filter(([, url]) => url),
      );
      for (const name of ["facebook", "linkedin", "instagram", "youtube", "whatsapp"])
        data.delete(`social_${name}`);
      data.set("social_links", JSON.stringify(socialLinks));
    }
    for (const [key, label, type] of config.fields) {
      if (type !== "json") continue;
      const raw = String(data.get(key) || "").trim();
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object")
          throw Error();
        data.set(key, JSON.stringify(parsed));
      } catch {
        setError(label + " must be a valid JSON object.");
        setBusy(false);
        return;
      }
    }
    for (const [key, , ,] of config.fields) {
      const el = e.currentTarget.elements.namedItem(key) as HTMLInputElement;
      if (el?.type === "checkbox") data.set(key, el.checked ? "true" : "false");
      if (el?.type === "file") {
        if (data.get(`_clear_${key}`) === "true") data.set(key, "");
        else if (!(data.get(key) as File)?.size) data.delete(key);
        data.delete(`_clear_${key}`);
      }
    }
    const url = config.singleton
      ? config.endpoint
      : value.id
        ? `${config.endpoint}${value.id}/`
        : config.endpoint;
    const r = await adminFetch(url, {
      method: config.singleton || value.id ? "PATCH" : "POST",
      body: data,
    });
    if (r.ok) saved();
    else
      setError(
        JSON.stringify(
          await r.json().catch(() => ({ message: "Save failed" })),
        ),
      );
    setBusy(false);
  }
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between border-b p-6">
          <h2 className="font-serif text-3xl">
            {value.id || config.singleton ? "Edit" : "Create"} {config.title}
          </h2>
          <button onClick={close}>✕</button>
        </div>
        <form
          onSubmit={submit}
          className="grid max-h-[75vh] gap-5 overflow-y-auto p-6 sm:grid-cols-2"
        >
          {config.fields.map(([key, label, type = "text", options]) => (
            <label
              key={key}
              className={
                type === "textarea" || type === "json" || type === "section" || type === "social-links" || type === "header-label" || type === "content-settings"
                  ? "sm:col-span-2"
                  : ""
              }
            >
              {type !== "section" && <span>{label}</span>}
              {type === "section" ? (
                <strong className="admin-form-section">{label}</strong>
              ) : type === "textarea" ? (
                <textarea
                  name={key}
                  defaultValue={String(value[key] || "")}
                  rows={4}
                />
              ) : type === "json" ? (
                <textarea
                  name={key}
                  defaultValue={jsonValue(value[key])}
                  rows={7}
                  spellCheck={false}
                  placeholder="{ }"
                />
              ) : type === "header-label" ? (
                <input
                  name="header_label"
                  defaultValue={String((value[key] as Record<string, unknown> | undefined)?.label || "")}
                  placeholder="For example: Our company"
                />
              ) : type === "content-settings" ? (
                <ContentSettings contentKey={String(value.key||"")} payload={(value[key] as Record<string,unknown>|undefined)||{}} />
              ) : type === "social-links" ? (
                <span className="grid gap-4 sm:grid-cols-2">
                  {["facebook", "linkedin", "instagram", "youtube", "whatsapp"].map((name) => (
                    <span key={name}>
                      <span>{name[0].toUpperCase()+name.slice(1)} URL</span>
                      <input
                        name={`social_${name}`}
                        type="url"
                        defaultValue={String((value[key] as Record<string,string>|undefined)?.[name] || "")}
                        placeholder={name === "whatsapp" ? "https://wa.me/880…" : `https://${name}.com/…`}
                      />
                    </span>
                  ))}
                </span>
              ) : type === "select" ? (
                <select name={key} defaultValue={String(value[key] || "")}>
                  <option value="">Select…</option>
                  {options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : type === "progress-select" ? (
                <select name={key} defaultValue={relationId(value[key])} required>
                  <option value="">Select a progress update</option>
                  {progressUpdates.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.project_name||"Project")} — {String(item.title||"Progress update")}</option>)}
                </select>
              ) : type === "project-select" ? (
                <select
                  key={relationId(value[key]) + "-" + projects.length}
                  name={key}
                  defaultValue={relationId(value[key])}
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={String(project.id)} value={String(project.id)}>
                      {String(project.name || project.code || project.id)}
                    </option>
                  ))}
                </select>
              ) : type === "property-type-select" ? (
                <select
                  key={String(value[key] || "") + "-" + propertyTypes.length}
                  name={key}
                  defaultValue={String(value[key] || "")}
                  required
                >
                  <option value="">Select property type…</option>
                  {propertyTypes.map((item) => (
                    <option key={String(item.id)} value={String(item.name)}>
                      {String(item.name || item.id)}
                    </option>
                  ))}
                </select>
              ) : type === "division-select" ? (
                <select
                  key={relationId(value[key]) + "-" + divisions.length}
                  name={key}
                  defaultValue={relationId(value[key])}
                  required
                >
                  <option value="">Select division…</option>
                  {divisions.map((item) => (
                    <option key={String(item.id)} value={String(item.id)}>
                      {String(item.name || item.id)}
                    </option>
                  ))}
                </select>
              ) : type === "district-select" ? (
                <select
                  key={relationId(value[key]) + "-" + districts.length}
                  name={key}
                  defaultValue={relationId(value[key])}
                  required
                >
                  <option value="">Select district…</option>
                  {districts.map((item) => (
                    <option key={String(item.id)} value={String(item.id)}>
                      {String(item.name || item.id)}
                    </option>
                  ))}
                </select>
              ) : type === "area-select" ? (
                <select
                  key={relationId(value[key]) + "-" + areas.length}
                  name={key}
                  defaultValue={relationId(value[key])}
                  required
                >
                  <option value="">Select area…</option>
                  {areas.map((item) => (
                    <option key={String(item.id)} value={String(item.id)}>
                      {String(item.name || item.id)}
                    </option>
                  ))}
                </select>
              ) : type === "amenities-select" ? (
                <>
                  <select
                    name={key}
                    value={selectedAmenities}
                    onChange={(event) =>
                      setSelectedAmenities(
                        Array.from(event.currentTarget.selectedOptions).map(
                          (option) => option.value,
                        ),
                      )
                    }
                    multiple
                    size={Math.min(Math.max(amenities.length, 4), 8)}
                  >
                    {amenities.map((item) => (
                      <option key={String(item.id)} value={String(item.id)}>
                        {String(item.name || item.id)}
                      </option>
                    ))}
                  </select>
                  <small className="mt-1 text-[10px] text-stone">
                    Hold Ctrl/Cmd to select multiple features.
                  </small>
                  <span className="mt-3">Create a new feature</span>
                  <span className="flex gap-2">
                    <input
                      value={featureName}
                      onChange={(event) => setFeatureName(event.target.value)}
                      placeholder="e.g. Prayer room"
                    />
                    <button
                      type="button"
                      className="admin-button shrink-0"
                      disabled={addingFeature || !featureName.trim()}
                      onClick={createFeature}
                    >
                      {addingFeature ? "Adding…" : "Add"}
                    </button>
                  </span>
                </>
              ) : type === "apartment-type-select" ? (
                <select
                  key={relationId(value[key]) + "-" + apartmentTypes.length}
                  name={key}
                  defaultValue={relationId(value[key])}
                  required
                >
                  <option value="">Select apartment type…</option>
                  {apartmentTypes.map((item) => (
                    <option key={String(item.id)} value={String(item.id)}>
                      {String(item.name || item.id)}
                    </option>
                  ))}
                </select>
              ) : type === "category-select" ? (
                <select
                  key={relationId(value[key]) + "-" + categories.length}
                  name={key}
                  defaultValue={relationId(value[key])}
                  required
                >
                  <option value="">Select category…</option>
                  {categories.map((category) => (
                    <option
                      key={String(category.id)}
                      value={String(category.id)}
                    >
                      {String(category.name || category.slug || category.id)}
                    </option>
                  ))}
                </select>
              ) : type === "tags-select" ? (
                <select
                  key={relationIds(value[key]).join("-") + "-" + tags.length}
                  name={key}
                  defaultValue={relationIds(value[key])}
                  multiple
                  size={Math.min(Math.max(tags.length, 3), 7)}
                >
                  {tags.map((tag) => (
                    <option key={String(tag.id)} value={String(tag.id)}>
                      {String(tag.name || tag.slug || tag.id)}
                    </option>
                  ))}
                </select>
              ) : type === "checkbox" ? (
                <input
                  name={key}
                  type="checkbox"
                  defaultChecked={Boolean(value[key])}
                  className="h-5 w-5"
                />
              ) : type === "file" ? (
                <FileInput
                  name={key}
                  current={value[key]}
                  image={imageFields.has(key)}
                />
              ) : (
                <input
                  name={key}
                  type={type}
                  readOnly={key === "key" && Boolean(value.id)}
                  step={type === "number" ? "any" : undefined}
                  defaultValue={type === "datetime-local" ? datetimeLocalValue(value[key]) : String(value[key] || "")}
                />
              )}
            </label>
          ))}
          {error && (
            <p className="break-all bg-red-50 p-3 text-xs text-red-700 sm:col-span-2">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t pt-5 sm:col-span-2">
            <button type="button" onClick={close}>
              Cancel
            </button>
            <button className="admin-button" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ContentSettings({contentKey,payload}:{contentKey:string;payload:Record<string,unknown>}){
  const list=(name:string)=>Array.isArray(payload[name])?(payload[name] as unknown[]).map(String).join("\n"):"";
  const show=(...keys:string[])=>keys.includes(contentKey)||keys.some(key=>payload[key]!==undefined);
  return <span className="grid gap-4 sm:grid-cols-2">
    <span><span>Small label above heading</span><input name="content_label" defaultValue={String(payload.label||"")} placeholder="For example: Our people"/></span>
    {show("our-story","private-conversation","video_url")&&<span><span>Video URL</span><input name="content_video_url" type="url" defaultValue={String(payload.video_url||"")} placeholder="https://youtube.com/watch?v=…"/></span>}
    {show("chairman-message","role")&&<span><span>Person&apos;s designation</span><input name="content_role" defaultValue={String(payload.role||"")}/></span>}
    {show("chairman-message","bio")&&<span className="sm:col-span-2"><span>Extended biography</span><textarea name="content_bio" rows={5} defaultValue={String(payload.bio||"")}/></span>}
    {show("company-values","items")&&<span className="sm:col-span-2"><span>List items — one item per line</span><textarea name="content_items" rows={6} defaultValue={list("items")}/></span>}
    {show("landowner-introduction","benefits_title")&&<span><span>Benefits heading</span><input name="content_benefits_title" defaultValue={String(payload.benefits_title||"")}/></span>}
    {show("landowner-introduction","benefits")&&<span className="sm:col-span-2"><span>Benefits — one benefit per line</span><textarea name="content_benefits" rows={7} defaultValue={list("benefits")}/></span>}
    {show("careers-application-panel","image_label")&&<span><span>Text shown over image</span><input name="content_image_label" defaultValue={String(payload.image_label||"")}/></span>}
    {show("careers-application-panel","image_title")&&<span><span>Heading shown over image</span><input name="content_image_title" defaultValue={String(payload.image_title||"")}/></span>}
    <small className="sm:col-span-2 text-stone">Only fields used by this section are shown. Existing advanced data is preserved automatically.</small>
  </span>
}
function FileInput({
  name,
  current,
  image,
}: {
  name: string;
  current: unknown;
  image: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(
    image && typeof current === "string" ? current : "",
  );
  const [selectedName, setSelectedName] = useState("");
  const [cleared, setCleared] = useState(false);
  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setCleared(false);
    setSelectedName(file?.name || "");
    setPreview((oldPreview) => {
      if (oldPreview.startsWith("blob:")) URL.revokeObjectURL(oldPreview);
      return file && image ? URL.createObjectURL(file) : "";
    });
  }
  function removeFile() {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedName("");
    setPreview("");
    setCleared(true);
  }
  function undoRemoval() {
    setCleared(false);
    setPreview(image && typeof current === "string" ? current : "");
  }
  return (
    <span className="admin-file-field">
      {preview && !cleared && (
        <span className="admin-image-preview">
          <img src={preview} alt="Selected image preview" />
          <small>{selectedName || "Current image"}</small>
        </span>
      )}
      {!image && typeof current === "string" && current && (
        <a href={current} target="_blank" rel="noreferrer">
          View current file ↗
        </a>
      )}
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={image ? "image/*" : undefined}
        onChange={selectFile}
      />
      {(preview || selectedName || (typeof current === "string" && current)) && !cleared && <button type="button" className="admin-file-clear" onClick={removeFile}>{selectedName?"Remove selected image":"Remove current image"}</button>}
      {cleared && typeof current === "string" && current && <button type="button" className="admin-file-clear undo" onClick={undoRemoval}>Undo image removal</button>}
      {cleared && <small className="admin-file-removed">Image will be removed when you save.</small>}
      <input type="hidden" name={`_clear_${name}`} value={cleared?"true":"false"}/>
      {selectedName && !image && <small>Selected: {selectedName}</small>}
    </span>
  );
}
function relationId(value: unknown) {
  if (value && typeof value === "object") {
    const row = value as Row;
    return String(row.id || row.pk || "");
  }
  return String(value || "");
}
function pageHeaderName(key: string) {
  const names: Record<string, string> = {
    "projects-header": "Projects",
    "about-header": "About Us",
    "team-header": "Our Team",
    "privacy-header": "Privacy Policy",
    "royel-club-header": "Royel Club",
    "blog-header": "Blog",
    "careers-hero": "Careers",
    "landowner-hero": "Landowner",
    "newsletter-header": "Newsletter",
    "image-gallery-header": "Image Gallery",
    "video-gallery-header": "Video Gallery",
  };
  return names[key] || key.replaceAll("-", " ");
}
function contentSectionName(key:string){
  const names:Record<string,string>={
    "home-featured-projects":"Featured projects heading","home-testimonials":"Testimonials heading","private-conversation":"Homepage video section","home-meeting":"Meeting request section",
    "our-story":"About Us — Our story","our-mission":"About Us — Mission","our-vision":"About Us — Vision","company-values":"About Us — Company values","chairman-message":"About Us — Chairman message",
    "careers-introduction":"Careers — Introduction","careers-application-panel":"Careers — Application panel",
    "landowner-introduction":"Landowner — Introduction and benefits","landowner-form-section":"Landowner — Form heading",
  };
  return names[key]||key.split("-").map(word=>word[0]?.toUpperCase()+word.slice(1)).join(" ");
}
function contentTypeName(type:string){const names:Record<string,string>={ABOUT:"About page",ACHIEVEMENT:"Achievement",STATISTIC:"Statistic",PROMOTION:"Promotional section",BUYER:"Buyer content",LANDOWNER:"Landowner content",CTA:"Call to action",FOOTER:"Footer",PRIVACY:"Privacy policy",TERMS:"Terms and conditions"};return names[type]||type.replaceAll("_"," ")}
function relationIds(value: unknown) {
  return Array.isArray(value)
    ? value.map(relationId).filter(Boolean)
    : value
      ? [relationId(value)]
      : [];
}
function jsonValue(value: unknown) {
  if (value == null || value === "") return "{}";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

function datetimeLocalValue(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return value.replace(" ", "T").slice(0, 16);
}
function Msg({ t }: { t: string }) {
  return <div className="p-12 text-center text-sm text-stone">{t}</div>;
}
function fmt(v: unknown) {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v))
    return v.length
      ? v
          .map((item) =>
            typeof item === "object" && item
              ? String((item as Row).name || (item as Row).id)
              : String(item),
          )
          .join(", ")
      : "—";
  if (v && typeof v === "object")
    return String((v as Row).name || (v as Row).id || "—");
  return v == null || v === "" ? "—" : String(v).replaceAll("_", " ");
}
function fmtDateTime(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fmt(value);
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
