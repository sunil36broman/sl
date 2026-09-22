/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {notFound} from "next/navigation";
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import {Icon} from "@/components/icons";
import {ProjectGallery} from "@/components/project-gallery";
import {ProjectMap} from "@/components/project-map";
import {AnimatedHeading} from "@/components/animated-heading";
import {ProjectInquiryForm} from "@/components/project-inquiry-form";
import {BrochureDownload} from "@/components/brochure-download";
import {UnlockPrice} from "@/components/unlock-price";
import {API_URL} from "@/lib/api";

const progressByStatus:Record<string,number>={UPCOMING:8,ONGOING:55,READY:92,HANDED_OVER:100};
const prettyDate=(date?:string|null)=>date?new Intl.DateTimeFormat("en",{day:"numeric",month:"short",year:"numeric"}).format(new Date(date)):"To be announced";
const value=(input:any,suffix="")=>input!==null&&input!==undefined&&input!==""?`${input}${suffix}`:"—";

export default async function Detail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  let project:any;
  try{const response=await fetch(`${API_URL}/projects/slug/${slug}/`,{cache:"no-store"});if(response.ok){const body=await response.json();project=body.data||body;}}catch{}
  if(!project)return notFound();
  const gallery=project.gallery_items||[];
  const mainImages=[project.hero_banner||project.featured_image,...gallery.filter((item:any)=>item.kind!=="FLOOR_PLAN").map((item:any)=>item.image||item.url)].filter(Boolean);
  const floorPlans=[...(project.apartment_types||[]).map((item:any)=>item.floor_plan),...gallery.filter((item:any)=>item.kind==="FLOOR_PLAN").map((item:any)=>item.image||item.url)].filter(Boolean);
  const apartment=project.apartment_types?.[0],progress=project.progress_updates?.[0]?.completion_percentage??progressByStatus[project.status]??35,address=project.address||project.area_name||"Dhaka, Bangladesh";
  const amenities=(project.amenity_details||[]).map((item:any)=>item.name).filter(Boolean),features=amenities.length?amenities:["Thoughtful architecture","Natural light and airflow","Landscaped common spaces","Secure resident parking"];
  const overview=[["Bedrooms",value(apartment?.bedrooms)],["Apartment Size",project.min_apartment_size===project.max_apartment_size?value(project.min_apartment_size," sqft"):`${value(project.min_apartment_size)} – ${value(project.max_apartment_size)} sqft`],["Building",project.floors?`G+${Math.max(project.floors-1,1)}`:"—"],["Apartments",value(project.apartment_count)],["Land Area",value(project.land_size," Katha")],["Car Parking",value(apartment?.parking_allocation||project.apartment_count)],["Facing",apartment?.facing||"—"],["Handover",prettyDate(project.expected_handover_date)]];
  return <><Header/><main className="bio-project-detail">
    <section className="bio-project-hero"><div className="shell"><nav className="bio-breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/properties">Projects</Link><span>›</span><b>{project.name}</b></nav><div className="bio-project-hero-grid"><div className="bio-project-summary"><span className="bio-status">{project.status.replaceAll("_"," ")}</span><AnimatedHeading as="h1">{project.name}</AnimatedHeading><p className="bio-address"><Icon name="pin"/>{address}</p><AnimatedHeading>At a glance</AnimatedHeading><div className="bio-overview-grid">{overview.map(([label,data],index)=><div key={label}><i>{["⌂","□","▥","▦","◇","P","⌁","◷"][index]}</i><span><small>{label}</small><strong>{data}</strong></span></div>)}</div><div className="bio-progress"><span><b>Construction Progress</b><strong>{progress}%</strong></span><div><i style={{width:`${progress}%`}}/></div></div><div className="bio-project-actions"><Link className="bio-brochure" href="/contact-us">Book a Consultation <span>→</span></Link><BrochureDownload projectId={project.id} projectName={project.name} brochureUrl={project.brochure}/><UnlockPrice projectId={project.id} projectName={project.name}/></div></div><div className="bio-project-visual"><ProjectGallery images={mainImages} name={project.name}/></div></div></div></section>
    <section className="bio-location"><div className="shell"><div className="bio-section-title"><i/><AnimatedHeading>Project Location</AnimatedHeading><i/></div><ProjectMap name={project.name} address={address} latitude={project.latitude} longitude={project.longitude} googleMapsUrl={project.google_maps_url}/></div></section>
    <section className="bio-features"><div className="shell"><p>{project.features_label||"Features"}</p><AnimatedHeading>{project.features_title||"What You Get"}</AnimatedHeading><div className="bio-feature-layout"><div className="bio-feature-image"><img src={project.features_image||mainImages[1]||mainImages[0]} alt={`${project.name} living experience`}/></div><div className="bio-feature-grid">{features.map((feature:string,index:number)=><div key={feature}><span>{String(index+1).padStart(2,"0")}</span><b>{feature}</b></div>)}</div></div></div></section>
    {floorPlans.length>0&&<section className="bio-floor-plans"><div className="shell"><p>Plans</p><AnimatedHeading>Project Gallery</AnimatedHeading><div>{floorPlans.map((image:string,index:number)=><a href={image} target="_blank" rel="noreferrer" key={`${image}-${index}`}><img src={image} alt={`${project.name} floor plan ${index+1}`}/><span>Floor Plan {index+1} ↗</span></a>)}</div></div></section>}
    <div id="property-enquiry"><ProjectInquiryForm projectId={project.id} projectName={project.name} image={project.inquiry_image||mainImages[1]||mainImages[0]} title={project.inquiry_title} description={project.inquiry_description}/></div>
  </main><Footer/></>;
}
