import { redirect } from "next/navigation";

export default async function LegacyGovernanceEvidenceReportRedirect({params}:{params:Promise<{id:string}>}){const{id}=await params;redirect(`/institutions/governance-evidence/report/${id}`)}
