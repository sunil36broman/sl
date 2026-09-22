import {AnimatedHeading} from "@/components/animated-heading";
import {loadPageHeader} from "@/lib/page-header";

export async function ManagedPageHeader({contentKey,className,defaultTitle,defaultBody="",defaultLabel="",gradient="linear-gradient(rgba(0,17,11,.52),rgba(0,17,11,.8))",bodyTag="p"}:{contentKey:string;className:string;defaultTitle:string;defaultBody?:string;defaultLabel?:string;gradient?:string;bodyTag?:"p"|"span"}){
  const header=await loadPageHeader(contentKey),label=String(header?.payload?.label||defaultLabel),body=header?.body||defaultBody,style=header?.image?{backgroundImage:`${gradient},url(${header.image})`}:undefined;
  return <section className={className} style={style}><div className="shell">{label&&<p>{label}</p>}<AnimatedHeading as="h1">{header?.title||defaultTitle}</AnimatedHeading>{body&&(bodyTag==="span"?<span>{body}</span>:<p>{body}</p>)}</div></section>;
}
