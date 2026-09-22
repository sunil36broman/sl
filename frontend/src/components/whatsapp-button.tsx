"use client";

import {useSiteSettings} from "./site-settings";
import {usePathname} from "next/navigation";

export function WhatsAppButton(){
  const site=useSiteSettings();
  const pathname=usePathname();
  const configured=site.social_links?.whatsapp||"";
  const number=(site.hotline||"+8801700000000").replace(/\D/g,"");
  const href=configured||`https://wa.me/${number}?text=${encodeURIComponent(`Hello ${site.company_name||"Raha Holdings"}, I would like to know more about your projects.`)}`;

  if(pathname.startsWith("/admin-dashboard")||pathname==="/dashboard"||pathname==="/login")return null;

  return <a className="whatsapp-button" href={href} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp" title="Chat with us on WhatsApp">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3A12.89 12.89 0 0 0 5 22.54L3.3 28.8l6.4-1.68A12.95 12.95 0 1 0 16.04 3Zm0 23.72a10.7 10.7 0 0 1-5.46-1.5l-.39-.23-3.8 1 1.02-3.7-.25-.4A10.79 10.79 0 1 1 16.04 26.72Zm5.92-8.08c-.32-.16-1.92-.95-2.22-1.06-.3-.11-.51-.16-.73.16-.21.32-.84 1.06-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.37-.5-2.6-1.61a9.77 9.77 0 0 1-1.8-2.24c-.2-.33-.02-.5.14-.66.15-.15.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.17-.73-1.76-1-2.41-.26-.64-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.4-.3.33-1.14 1.12-1.14 2.72 0 1.6 1.17 3.15 1.33 3.37.16.21 2.3 3.5 5.57 4.92.78.34 1.38.54 1.86.69.78.25 1.49.21 2.05.13.62-.09 1.92-.79 2.19-1.55.27-.76.27-1.41.19-1.55-.08-.13-.3-.21-.62-.37Z"/></svg>
  </a>;
}
