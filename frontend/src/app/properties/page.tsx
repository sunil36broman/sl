import {Header} from "@/components/header";
import {Footer} from "@/components/footer";
import {ProjectGrid} from "@/components/project-grid";
import {AnimatedHeading} from "@/components/animated-heading";
import {ProjectFilters} from "@/components/project-filters";
import {API_URL,Project} from "@/lib/api";
import {loadPageHeader} from "@/lib/page-header";

export const metadata={title:"Projects"};

type ApiList<T>={data?:T[];results?:T[];count?:number};
type Option={id:string;name:string;is_active?:boolean};

async function readList<T>(url:string):Promise<{items:T[];count:number}>{
  const response=await fetch(url,{cache:"no-store"});
  if(!response.ok)throw new Error(`API request failed: ${response.status}`);
  const body:ApiList<T>=await response.json();
  const items=body.data||body.results||[];
  return {items,count:body.count??items.length};
}

export default async function Projects({searchParams}:{searchParams:Promise<Record<string,string>>}){
  const query=await searchParams;
  const apiParams=new URLSearchParams({page_size:"100"});
  for(const key of ["status","property_type","location","search"]){
    if(query[key])apiParams.set(key,query[key]);
  }
  if(query.size){
    const[min,max]=query.size.split("-");
    if(min&&min!=="0")apiParams.set("min_size",min);
    if(max&&max!=="0")apiParams.set("max_size",max);
  }

  let items:Project[]=[];
  let count=0;
  let propertyTypes:Option[]=[];
  let areas:Option[]=[];
  try{
    const[projects,types,locations]=await Promise.all([
      readList<Project>(`${API_URL}/projects/?${apiParams}`),
      readList<Option>(`${API_URL}/property-types/?page_size=100`),
      readList<Option>(`${API_URL}/areas/?page_size=100`),
    ]);
    items=projects.items;
    count=projects.count;
    propertyTypes=types.items.filter(item=>item.is_active!==false);
    areas=locations.items.filter(item=>item.is_active!==false);
  }catch{}

  const header=await loadPageHeader("projects-header");
  return <><div className="absolute inset-x-0 top-0 z-40"><Header dark/></div><main className="projects-page"><section className="projects-banner" style={header?.image?{backgroundImage:`url(${header.image})`}:undefined}><div className="projects-banner-shade"/><div className="shell"><p>Our Portfolio</p><AnimatedHeading as="h1">{header?.title||"Projects"}</AnimatedHeading><span>{header?.body||"Distinctive addresses, thoughtfully created for modern life."}</span></div></section><section className="projects-filter-section"><div className="shell"><ProjectFilters locations={areas.map(item=>item.name)} propertyTypes={propertyTypes.map(item=>item.name)}/></div></section><section className="projects-body"><div className="shell"><div className="projects-heading"><div><p>Explore our work</p><AnimatedHeading>Signature Projects</AnimatedHeading></div><span>{count} projects</span></div>{items.length?<ProjectGrid projects={items}/>:<div className="empty"><h3>No projects found</h3><p>Try another status, type, location, size, or project name.</p></div>}</div></section></main><Footer/></>;
}
