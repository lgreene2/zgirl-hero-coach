import type {Metadata} from "next";
import SiteHeader from "@/components/SiteHeader";
import ExecutiveBriefingPacket from "@/components/institutions/ExecutiveBriefingPacket";

export const metadata:Metadata={title:"Executive Briefing Packet",description:"Restricted Z-Girl institutional executive briefing packet.",robots:{index:false,follow:false}};

export default async function ExecutiveBriefingPacketPage({params}:{params:Promise<{id:string}>}){const{id}=await params;return <main className="min-h-screen bg-[#061521] text-white"><div className="print:hidden"><SiteHeader/></div><ExecutiveBriefingPacket id={id}/></main>}
