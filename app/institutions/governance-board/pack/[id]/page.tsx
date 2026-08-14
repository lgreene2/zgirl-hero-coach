import type {Metadata} from "next";
import SiteHeader from "@/components/SiteHeader";
import BoardGovernancePacket from "@/components/institutions/BoardGovernancePacket";

export const metadata:Metadata={title:"Board Governance Packet | Z-Girl",description:"Restricted institutional board governance and evidence packet.",robots:{index:false,follow:false}};

export default async function BoardGovernancePacketPage({params}:{params:Promise<{id:string}>}){const{id}=await params;return <main className="min-h-screen bg-[#061521] text-white print:bg-white"><div className="print:hidden"><SiteHeader/></div><BoardGovernancePacket id={id}/></main>}
