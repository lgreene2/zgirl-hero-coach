import fs from "node:fs";
import path from "node:path";

const root=process.cwd();const errors=[];const warnings=[];
const read=p=>fs.readFileSync(path.join(root,p),"utf8");const json=p=>JSON.parse(read(p));
function requireFile(p){if(!fs.existsSync(path.join(root,p)))errors.push(`Missing required file: ${p}`);}
function requireText(p,patterns){requireFile(p);if(!fs.existsSync(path.join(root,p)))return;const src=read(p);for(const re of patterns)if(!re.test(src))errors.push(`${p} missing required guard: ${re}`);}

const pkg=json("package.json");
if(pkg.version!=="3.11.1")errors.push(`package.json must be 3.11.1; found ${pkg.version}`);
const manifest=json("release/zgirl-v3.11-operational-pilot.json");
if(manifest.release!==pkg.version)errors.push(`v3.11 manifest ${manifest.release} does not match package ${pkg.version}`);
if(manifest.productionBaseline?.mainSha!=="4f7f2b4e255d0dbd6e81d2da627932b2586fe776")errors.push("v3.11.1 operational baseline changed; reconcile current main before release.");
requireFile("release/zgirl-v3.10-release-train.json");
for(const p of manifest.requiredFiles??[])requireFile(p);for(const p of manifest.requiredMigrations??[])requireFile(p);
requireText("lib/release.ts",[/ZGIRL_RELEASE_VERSION\s*=\s*["']3\.11\.1["']/,/ZGIRL_RELEASE_TRAIN\s*=\s*["']v3\.11\.1-first-owner-bootstrap["']/]);

const directGrant=/grant\s+(?:select|insert|update|delete|truncate|references|trigger|all(?:\s+privileges)?)\b[\s\S]{0,240}?\bon\s+(?:table\s+)?(?:public\.)?zgirl_[a-z0-9_]+[\s\S]{0,160}?\bto\s+(?:anon|authenticated)\b/i;
for(const p of manifest.requiredMigrations??[]){if(fs.existsSync(path.join(root,p))&&directGrant.test(read(p)))errors.push(`Direct anon/authenticated table grant detected in ${p}`);}

const core="supabase/migrations/20260816_zgirl_operational_activation_pilot_engine_v3_11.sql";
requireText(core,[/is_test boolean not null default false/,/named_system_owner_required/,/gls_opportunity_required/,/participant_capacity/,/claim_type text not null/,/participant_feedback_aggregate/,/zgirl_pilot_competency_signals/,/alter table public\.zgirl_pilot_programs enable row level security/]);
const coreSrc=read(core);
for(const forbidden of [/participant_name\s+text/i,/participant_email\s+text/i,/private_reflection\s+text/i,/reflection_text\s+text/i,/diagnosis\s+text/i,/clinical_note\s+text/i])if(forbidden.test(coreSrc))errors.push(`Pilot admin schema contains prohibited participant/private field pattern: ${forbidden}`);
if(/zgirl_credential_migrations/.test(coreSrc))errors.push("v3.11 migration must not depend on obsolete zgirl_credential_migrations bookkeeping table.");

const lifecycle="supabase/migrations/20260816_zgirl_pilot_lifecycle_evidence_hardening_v3_11.sql";
requireText(lifecycle,[/zgirl_pilot_transition_allowed/,/pilot_qualification_incomplete/,/pilot_implementation_owner_required/,/pilot_safety_contact_required/,/pilot_executed_agreement_required/,/pilot_evidence_required/,/pilot_closeout_required/,/pilot_metric_integrity_failed/]);
const permissions="supabase/migrations/20260816_zgirl_pilot_scope_permission_controls_v3_11.sql";
requireText(permissions,[/zgirl_pilot_save_scope_metadata/,/pilot_permission_reference_required/,/pilot\.evidence/]);

const bootstrap="supabase/migrations/20260818_zgirl_first_owner_bootstrap_gls_candidate_queue_v3_11_1.sql";
requireText(bootstrap,[
 /private\.zgirl_bootstrap_first_system_owner/,
 /first_owner_bootstrap_closed/,
 /exists\(select 1 from public\.zgirl_operator_identities\)/,
 /gen_random_bytes\(24\)/,
 /revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from anon/,
 /revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from authenticated/,
 /public\.zgirl_gls_pilot_candidates/,
 /pipeline\.read/,
 /duplicateCrmCreated','?false|duplicateCrmCreated',false/,
 /participantPrivateReflectionData','?false|participantPrivateReflectionData',false/
]);
const bootstrapSrc=read(bootstrap);
if(/grant execute on function private\.zgirl_bootstrap_first_system_owner/i.test(bootstrapSrc))errors.push("First-owner bootstrap must not be granted to application roles.");
if(/insert into public\.gls_opportunities/i.test(bootstrapSrc))errors.push("Z-Girl candidate queue must not create GLS opportunities or duplicate CRM state.");

const hotfix="supabase/migrations/20260819_zgirl_first_owner_bootstrap_audit_event_hotfix_v3_11_1.sql";
requireText(hotfix,[/private\.zgirl_bootstrap_first_system_owner/,/event_type,summary/,/'operator_created'/,/revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from anon/,/revoke all on function private\.zgirl_bootstrap_first_system_owner\(text,text\) from authenticated/]);
const hotfixSrc=read(hotfix);
if(/first_system_owner_bootstrap_prepared/.test(hotfixSrc))errors.push("Bootstrap audit hotfix must use an established allowed audit event type.");

for(const route of ["app/api/institutions/ops/pilots/dashboard/route.ts","app/api/institutions/ops/pilots/action/route.ts","app/api/institutions/ops/pilots/scope/route.ts","app/api/institutions/ops/pilots/gls-sync/route.ts","app/api/institutions/ops/pilots/gls-candidates/route.ts"])requireText(route,[/credentialSessionToken|requireOperatorCapability/,/credentialErrorResponse|unauthorized/]);
requireText("app/api/institutions/ops/pilots/action/route.ts",[/create_pilot/,/pilotId/,/save_permissions/,/advance_stage/]);
requireText("lib/gls/pilot-bridge.ts",[/ZGIRL_GLS_BRIDGE_URL/,/ZGIRL_GLS_BRIDGE_SECRET/,/participantPrivateReflectionData/]);
const bridge=read("lib/gls/pilot-bridge.ts");if(/SERVICE_ROLE|SUPABASE_SECRET/i.test(bridge))errors.push("Z-Girl GLS bridge must not use database service-role credentials.");
requireText("components/institutions/GlsPilotCandidateQueue.tsx",[/GLS source-of-truth queue/,/No qualified GLS opportunity is currently recorded/,/does not carry participant reflection text/i]);
requireText("app/institutions/ops/pilots/page.tsx",[/GlsPilotCandidateQueue/,/v3\.11\.1/]);

requireText("components/institutions/PilotEvidencePackage.tsx",[/participant_reported/,/facilitator_reported/,/system_analytic/,/Private reflection text is excluded/]);
requireText("components/institutions/PilotCommercialPackage.tsx",[/GLS remains the source of truth/,/Public self-service checkout is not required/,/Statement-of-work structure/]);
requireText("components/institutions/PilotPermissions.tsx",[/permission\/approval reference/i,/does not infer consent/i]);

requireText("lib/commerce.ts",[/if\s*\(!getSellerName\(\)\)\s*return\s+null/,/ZGIRL_CHECKOUT_LINKS_JSON/,/url\.protocol\s*!==\s*["']https:["']/]);
const checkoutOfferCount=(read("lib/commerce.ts").match(/mode:\s*["']checkout["']/g)??[]).length;if(checkoutOfferCount!==4)errors.push(`Expected unchanged four-offer checkout gate; found ${checkoutOfferCount}`);
if(manifest.operatingModel?.publicCheckoutRequiredForInstitutionalPilot!==false||manifest.operatingModel?.publicPaidLaunchExpected!==false)errors.push("v3.11 institutional pilot release must keep public commerce separately gated.");
if(manifest.operatingModel?.participantPrivateReflectionAdminAccess!==false||manifest.operatingModel?.individualParticipantRegistryInInstitutionAdmin!==false)errors.push("v3.11 manifest weakens participant privacy boundary.");
if(manifest.operatingModel?.realPilotRequiresNamedSystemOwner!==true||manifest.operatingModel?.commercialRealPilotRequiresGlsOpportunity!==true)errors.push("v3.11 real-pilot activation gates are missing from manifest.");
if(manifest.operatingModel?.firstOwnerBootstrapDatabaseAdminOnly!==true||manifest.operatingModel?.firstOwnerBootstrapReusableAfterAnyNamedIdentityExists!==false)errors.push("v3.11.1 first-owner bootstrap boundary missing from manifest.");
if(manifest.operatingModel?.glsCandidateQueueCreatesDuplicateCrm!==false||manifest.operatingModel?.glsCandidateQueueCarriesParticipantPrivateReflectionData!==false)errors.push("v3.11.1 GLS candidate queue boundary missing from manifest.");

const lock=json("package-lock.json"),rootLock=lock.packages?.[""]??{};const lockOk=lock.version===pkg.version&&rootLock.version===pkg.version&&Boolean(rootLock.dependencies?.qrcode)&&Boolean(rootLock.devDependencies?.["@types/qrcode"]);if(!lockOk)errors.push(`package-lock is not reproducible for ${pkg.version}`);
for(const wf of [".github/workflows/verify-release.yml",".github/workflows/reviewer-activation-ci.yml"])requireText(wf,[/npm ci --no-audit --no-fund/]);

if((manifest.pilotTables??[]).length!==11)errors.push("v3.11 manifest must enumerate all 11 pilot tables.");
if((manifest.lifecycle??[]).join(",")!=="opportunity,qualified,agreement_scope,institution_setup,onboarding,pilot_ready,live,evidence_collection,completed,renewal,expansion")errors.push("v3.11 lifecycle manifest drift detected.");

for(const w of warnings)console.warn(`WARN: ${w}`);if(errors.length){for(const e of errors)console.error(`ERROR: ${e}`);console.error(`v3.11.1 verification failed with ${errors.length} error(s).`);process.exit(1);}console.log(`Z-Girl operational activation verification passed for ${pkg.version}.`);console.log(`Pilot tables: ${(manifest.pilotTables??[]).length}`);console.log(`Required migrations: ${(manifest.requiredMigrations??[]).length}`);console.log(`Required files: ${(manifest.requiredFiles??[]).length}`);
