import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ContactForm } from "@/components/contact-form";
import { AnimatedHeading } from "@/components/animated-heading";
import { Icon } from "@/components/icons";
import { API_URL } from "@/lib/api";
type Settings = {
  company_name?: string;
  hotline?: string;
  email?: string;
  office_address?: string;
  business_hours?: string;
  google_maps_url?: string;
  contact_hero_label?: string;
  contact_hero_title?: string;
  contact_hero_image?: string;
  contact_details_label?: string;
  contact_details_title?: string;
  contact_form_label?: string;
  contact_form_title?: string;
  contact_image_label?: string;
  contact_image_title?: string;
  contact_form_image?: string;
  contact_map_embed_url?: string;
  contact_map_button_label?: string;
  contact_name_label?: string;
  contact_phone_label?: string;
  contact_email_label?: string;
  contact_user_type_label?: string;
  contact_client_label?: string;
  contact_landowner_label?: string;
  contact_message_label?: string;
  contact_submit_label?: string;
};
export const metadata = { title: "Contact Us" };
function mapEmbedUrl(value: string | undefined, address: string) {
  const fallback = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`;
  if (!value) return fallback;
  try {
    const url = new URL(value);
    if (url.pathname.includes("/maps/embed") || url.searchParams.get("output") === "embed")
      return value;
    if (url.hostname.includes("google.") || url.hostname.includes("google.com")) {
      const query = url.searchParams.get("q") || url.searchParams.get("query");
      if (query)
        return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
    }
  } catch {}
  return fallback;
}
export default async function ContactUs() {
  let settings: Settings = {};
  try {
    const response = await fetch(`${API_URL}/settings/public/`, {
        cache: "no-store",
      }),
      body = await response.json();
    settings = body.data || body;
  } catch {}
  const address =
      settings.office_address || "Gulshan Avenue, Dhaka, Bangladesh",
    map = mapEmbedUrl(settings.contact_map_embed_url, address);
  return (
    <>
      <Header />
      <main className="contact-page">
        <section
          className="contact-hero"
          style={
            settings.contact_hero_image
              ? {
                  backgroundImage: `url("${settings.contact_hero_image}")`,
                }
              : undefined
          }
        >
          <div />
          <div className="shell">
            <p className="contact-eyebrow">{settings.contact_hero_label || "We are here to help"}</p>
            <AnimatedHeading as="h1" className="contact-page-title">{settings.contact_hero_title || "Contact Us"}</AnimatedHeading>
            <span className="contact-hero-copy">Our team is ready to help you find the right property, answer your questions, and guide your next step.</span>
          </div>
        </section>
        <section className="contact-location">
          <div className="contact-details">
            <p className="contact-eyebrow">{settings.contact_details_label || "Visit or talk to us"}</p>
            <AnimatedHeading>{settings.contact_details_title || "Let's start a conversation."}</AnimatedHeading>
            <span className="contact-details-copy">Whether you are looking for a home, an investment, or a trusted development partner, we would be pleased to hear from you.</span>
            <ul>
              <li>
                <span className="contact-detail-icon"><Icon name="pin" /></span>
                <span><small>Head office</small>{address}</span>
              </li>
              <li>
                <span className="contact-detail-icon" aria-hidden="true">☎</span>
                <span><small>Call us</small><a href={`tel:${settings.hotline || "+8801700000000"}`}>
                  {settings.hotline || "+880 1700 000000"}
                </a></span>
              </li>
              <li>
                <span className="contact-detail-icon" aria-hidden="true">✉</span>
                <span><small>Email us</small><a href={`mailto:${settings.email || "info@raha.com"}`}>
                  {settings.email || "info@raha.com"}
                </a></span>
              </li>
              <li>
                <span className="contact-detail-icon" aria-hidden="true">◷</span>
                <span><small>Office hours</small>
                  {settings.business_hours ||
                    "Saturday–Thursday, 9:00 AM–6:00 PM"}
                </span>
              </li>
            </ul>
          </div>
          <div className="contact-map">
            <iframe
              src={map}
              title={`${settings.company_name || "Raha"} office location`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href={
                settings.google_maps_url ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
              }
              target="_blank"
              rel="noreferrer"
            >
              {settings.contact_map_button_label || "View larger map"} ↗
            </a>
          </div>
        </section>
        <section className="contact-form-section">
          <div className="shell contact-form-grid">
            <div
              className="contact-form-image"
              style={
                settings.contact_form_image
                  ? { backgroundImage: `url("${settings.contact_form_image}")` }
                  : undefined
              }
            >
              <div>
                <span>{settings.contact_image_label || "Personal assistance"}</span>
                <AnimatedHeading>{settings.contact_image_title || "We would love to hear from you."}</AnimatedHeading>
              </div>
            </div>
            <div className="contact-form-card">
              <p className="contact-eyebrow">{settings.contact_form_label || "Send a message"}</p>
              <AnimatedHeading className="contact-form-title">{settings.contact_form_title || "Contact Us"}</AnimatedHeading>
              <span className="contact-form-copy">Share a few details and one of our advisors will get back to you shortly.</span>
              <ContactForm companyName={settings.company_name || "Raha Holdings"} labels={{name:settings.contact_name_label,phone:settings.contact_phone_label,email:settings.contact_email_label,userType:settings.contact_user_type_label,client:settings.contact_client_label,landowner:settings.contact_landowner_label,message:settings.contact_message_label,submit:settings.contact_submit_label}} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
