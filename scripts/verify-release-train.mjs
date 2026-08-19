import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const errors=[];
const warnings=[];
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const json=(p)=>JSON.parse(read(p));
function requireFile(p){if(!fs.existsSync(path.join(root,p)))errors.push(`Missing required file: ${p}`);}
function requireText(p,patterns){requireFile(p);if(!fs.existsSync(path.join(root,p)))return;const src=read(p);for(const re of patterns)if(!re.test(src))errors.push(`${p} missing required guard: ${re}`);}

const pkg=json("package.json");
if(pkg.version!=="3.12.0")errors.push(`package.json must be 3.12.0; found ${pkg.version}`);

const guidedManifest=json("release/zgirl-v3.12-guided-coach.json");
if(guidedManifest.release!==pkg.version)errors.push(`Guided Coach manifest ${guidedManifest.release} does not match package ${pkg.version}`);
if(guidedManifest.productionBaseline?.mainSha!=="695fe870fa14797154de790500fd2d95a9b936fc")errors.push("v3.12 production baseline changed; reconcile current main before release.");
for(const p of guidedManifest.requiredFiles??[])requireFile(p);

const priorManifestPath="release/zgirl-v3.11-operational-pilot.json";
requireFile(priorManifestPath);
const prior=fs.existsSync(path.join(root,priorManifestPath))?json(priorManifestPath):{};
for(const p of prior.requiredFiles??[])requireFile(p);
for(const p of prior.requiredMigrations??[])requireFile(p);
requireFile("release/zgirl-v3.10-release-train.json");

requireText("lib/release.ts",[/ZGIRL_RELEASE_VERSION\s*=\s*["']3\.12\.0["']/,/ZGIRL_RELEASE_TRAIN\s*=\s*["']v3\.12-command-center-guided-coach["']/,/governed-institutional-guided-operations/]);

// Preserve the v3.11 tenant/privacy foundation.
const directGrant=/grant\s+(?:select|insert|update|delete|truncate|references|trigger|all(?:\s+privileges)?)\b[\s\S]{0,240}?\bon\s+(?:table\s+)?(?:public\.)?zgirl_[a-z0-9_]+[\s\S]{0,160}?\bto\s+(?:anon|authenticated)\b/i;
for(const p of prior.requiredMigrations??[]){if(fs.existsSync(path.join(root,p))&&directGrant.test(read(p)))errors.push(`Direct anon/authenticated Z-Girl table grant detected in ${p}`);}

const pilotCore="supabase/migrations/20260816_zgirl_operational_activation_pilot_engine_v3_11.sql";
requireText(pilotCore,[/is_test boolean not null default false/,/named_system_owner_required/,/gls_opportunity_required/,/participant_feedback_aggregate/,/alter table public\.zgirl_pilot_programs enable row level security/]);
const pilotSrc=read(pilotCore);
for(const forbidden of [/participant_name\s+text/i,/participant_email\s+text/i,/private_reflection\s+text/i,/reflection_text\s+text/i,/diagnosis\s+text/i,/clinical_note\s+text/i])if(forbidden.test(pilotSrc))errors.push(`Pilot admin schema contains prohibited participant/private field pattern: ${forbidden}`);

const bootstrap="supabase/migrations/20260818_zgirl_first_owner_bootstrap_gls_candidate_queue_v3_11_1.sql";
requireText(bootstrap,[/private\.zgirl_bootstrap_first_system_owner/,/first_owner_bootstrap_closed/,/revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from anon/,/revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from authenticated/,/public\.zgirl_gls_pilot_candidates/,/pipeline\.read/,/duplicateCrmCreated/,/participantPrivateReflectionData/]);
const hotfix="supabase/migrations/20260819_zgirl_first_owner_bootstrap_audit_event_hotfix_v3_11_1.sql";
requireText(hotfix,[/private\.zgirl_bootstrap_first_system_owner/,/'operator_created'/,/revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from anon/,/revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from authenticated/]);
if(/first_system_owner_bootstrap_prepared/.test(read(hotfix)))errors.push("Bootstrap hotfix regressed to an invalid audit event type.");

for(const route of ["app/api/institutions/ops/pilots/dashboard/route.ts","app/api/institutions/ops/pilots/action/route.ts","app/api/institutions/ops/pilots/gls-candidates/route.ts"])requireText(route,[/credentialSessionToken|requireOperatorCapability/,/credentialErrorResponse|unauthorized/]);
requireText("components/institutions/GlsPilotCandidateQueue.tsx",[/GLS source-of-truth queue/,/does not carry participant reflection text/i,/data-guide-target="gls-queue"/,/data-guide-target=\{index === 0 \? "gls-opportunity-card"/]);

// Commerce remains separate from training and still seller-first.
requireText("lib/commerce.ts",[/if\s*\(!getSellerName\(\)\)\s*return\s+null/,/ZGIRL_CHECKOUT_LINKS_JSON/,/url\.protocol\s*!==\s*["']https:["']/]);
const checkoutOfferCount=(read("lib/commerce.ts").match(/mode:\s*["']checkout["']/g)??[]).length;
if(checkoutOfferCount!==4)errors.push(`Expected unchanged four-offer checkout gate; found ${checkoutOfferCount}`);

// Guided Coach implementation and voice boundary.
const coachPath="components/institutions/InstitutionGuidedCoach.tsx";
requireText(coachPath,[
 /usePathname/,
 /@\/app\/lib\/voice/,
 /pickVoice/,
 /rankVoices/,
 /SpeechSynthesisUtterance/,
 /onClick=\{speak\}/,
 /Show captions\/transcript/,
 /Audio never starts automatically/,
 /\/api\/institutions\/ops\/identity\/dashboard/,
 /\/api\/institutions\/ops\/pilots\/gls-candidates/,
 /localStorage/,
 /Guide Me/,
 /Command Center map/,
 /Full orientation/
]);
const coachSrc=read(coachPath);
for(const forbidden of [/method:\s*["']POST["']/,/\/api\/institutions\/auth\/login/,/\/api\/institutions\/auth\/accept-invite/,/accessCode\s*:/,/inviteCode\s*:/,/SUPABASE_SECRET/i,/SERVICE_ROLE/i])if(forbidden.test(coachSrc))errors.push(`Guided Coach contains a forbidden mutation/secret access pattern: ${forbidden}`);
if(/autoPlay/i.test(coachSrc))errors.push("Guided Coach must not autoplay voice or media.");

const lessonPath="lib/institutions/guided-coach.ts";
requireText(lessonPath,[
 /Command Center Map/,
 /Executive Portfolio/,
 /Partner Pipeline/,
 /Pilot Command Center/,
 /Agreement Workflows/,
 /License Administration/,
 /Identity & Access/,
 /NEW does not mean QUALIFIED/,
 /Private reflection stays private/,
 /Human gates remain human/,
 /Greene Leadership System owns opportunity, proposal, agreement, invoice, payment/,
 /Z-Girl owns governed implementation readiness/
]);

requireText("app/institutions/ops/guide/page.tsx",[/Command Center Guided Coach/,/Role-aware operator training/,/Voice never autoplays/,/Training completion does not grant a role/]);
requireText("components/SiteHeader.tsx",[/InstitutionGuidedCoach/]);
requireText("app/institutions/ops/portfolio/page.tsx",[/href="\/institutions\/ops\/pilots"/,/Pilot Command Center/,/href="\/institutions\/ops\/guide"/]);
requireText("app/institutions/ops/pilots/page.tsx",[/v3\.12/,/Guided orientation/,/data-guide-target="pilot-operations"/]);
requireText("components/institutions/InstitutionOperatorAccess.tsx",[/data-guide-target="auth-mode"/]);
requireText("app/lib/voice.ts",[/NATURAL_HINTS/,/FEMININE_HINTS/,/rankVoices/,/pickVoice/]);
requireText("docs/ZGIRL_V3_12_COMMAND_CENTER_GUIDED_COACH.md",[/Listen → See → Do → Confirm/,/never autoplays audio/i,/Completion is a usability marker only/,/must never narrate or intentionally capture/i]);

if(guidedManifest.guidedCoach?.voiceUserInitiatedOnly!==true)errors.push("Guided Coach manifest must require user-initiated voice.");
if(guidedManifest.guidedCoach?.readsAuthenticationSecrets!==false)errors.push("Guided Coach manifest must exclude authentication secrets.");
if(guidedManifest.guidedCoach?.readsParticipantPrivateReflections!==false)errors.push("Guided Coach manifest must exclude participant private reflections.");
if(guidedManifest.guidedCoach?.grantsRoles!==false||guidedManifest.guidedCoach?.satisfiesApprovalGates!==false||guidedManifest.guidedCoach?.createsCredentials!==false)errors.push("Guided Coach must remain non-authoritative training guidance.");
if(guidedManifest.guidedCoach?.mutatesOpportunityState!==false||guidedManifest.guidedCoach?.mutatesPilotState!==false)errors.push("Guided Coach must not mutate opportunity or pilot state.");

// Locked dependency reproducibility remains mandatory.
const lock=json("package-lock.json");
const lockRoot=lock.packages?.[""]??{};
const lockOk=lock.version===pkg.version&&lockRoot.version===pkg.version&&Boolean(lockRoot.dependencies?.qrcode)&&Boolean(lockRoot.devDependencies?.["@types/qrcode"]);
if(!lockOk)errors.push(`package-lock is not reproducible for ${pkg.version}`);
for(const wf of [".github/workflows/verify-release.yml",".github/workflows/reviewer-activation-ci.yml"])requireText(wf,[/npm ci --no-audit --no-fund/]);

for(const warning of warnings)console.warn(`WARN: ${warning}`);
if(errors.length){for(const error of errors)console.error(`ERROR: ${error}`);console.error(`v3.12 verification failed with ${errors.length} error(s).`);process.exit(1);}
console.log(`Z-Girl Guided Coach release verification passed for ${pkg.version}.`);
console.log(`Initial guide coverage: ${(guidedManifest.initialCoverage??[]).length}`);
console.log(`Required Guided Coach files: ${(guidedManifest.requiredFiles??[]).length}`);
console.log(`Known warnings: ${warnings.length}`);
