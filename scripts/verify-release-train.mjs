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
if(pkg.version!=="3.14.1")errors.push(`package.json must be 3.14.1; found ${pkg.version}`);

const currentManifest=json("release/zgirl-v3.14.1-natural-ai-voice-candidate.json");
if(currentManifest.release!==pkg.version)errors.push(`v3.14.1 manifest ${currentManifest.release} does not match package ${pkg.version}`);
for(const p of currentManifest.requiredFiles??[])requireFile(p);
if(currentManifest.alignment?.contract!=="greene.ecosystem-alignment-lock.v1")errors.push("v3.14.1 must remain bound to Ecosystem Alignment Lock v1.");
if(currentManifest.alignment?.cedarIdentityReused!==false||currentManifest.alignment?.nativeLanguageReviewAssetsReused!==false)errors.push("v3.14.1 must not reuse Cedar or protected native-language review identities.");
if(currentManifest.voiceCandidate?.providerStorageDisabled!==true)errors.push("v3.14.1 must disable provider-side Interaction storage.");
if(currentManifest.voiceCandidate?.autoplayEnabled!==false)errors.push("v3.14.1 voice must remain user initiated.");
if(currentManifest.voiceCandidate?.humanListeningRequired!==true||currentManifest.voiceCandidate?.humanListeningApproved!==true||currentManifest.voiceCandidate?.publicReleaseApproved!==true||typeof currentManifest.voiceCandidate?.approvedBy!=="string")errors.push("v3.14.1 must retain explicit product-owner listening approval evidence.");
if(currentManifest.privacy?.sendsMicrophoneAudio!==false||currentManifest.privacy?.sendsConversationHistory!==false||currentManifest.privacy?.storesGeneratedAudio!==false||currentManifest.privacy?.logsSpokenTranscript!==false)errors.push("v3.14.1 voice privacy boundary changed.");

const humanManifest=json("release/zgirl-v3.14-human-readiness-release-evidence.json");
if(humanManifest.release!=="3.14.0")errors.push(`Human-readiness baseline must remain 3.14.0; found ${humanManifest.release}`);
for(const p of humanManifest.requiredFiles??[])requireFile(p);
for(const p of humanManifest.requiredMigrations??[])requireFile(p);
if(humanManifest.operatingModel?.livePilotHumanReleaseRequired!==true)errors.push("v3.14 must preserve the final human live-release gate.");
if(humanManifest.operatingModel?.participantPrivateReflectionTransfer!==false)errors.push("v3.14 must prohibit participant private-reflection transfer.");
if(humanManifest.operatingModel?.humanDecisionAutoAdvancesStage!==false)errors.push("v3.14 human decisions must not auto-advance the pilot stage.");
if(humanManifest.operatingModel?.testPilotReleaseAuthorizationAllowed!==false||humanManifest.operatingModel?.testPilotLiveStageAllowed!==false)errors.push("v3.14 must prohibit real release authorization and Live stage for test pilots.");
if((humanManifest.releaseEvidenceGates??[]).length!==11)errors.push("v3.14 must define exactly 11 governed release-evidence gates.");
if(JSON.stringify(humanManifest.humanDecisions)!==JSON.stringify(["ready","ready_with_conditions","not_ready"]))errors.push("v3.14 human decision vocabulary changed.");

const handoffManifest=json("release/zgirl-v3.13-gls-qualification-activation-handoff.json");
if(handoffManifest.release!=="3.13.0")errors.push(`GLS handoff baseline must remain 3.13.0; found ${handoffManifest.release}`);
for(const p of handoffManifest.requiredFiles??[])requireFile(p);
for(const p of handoffManifest.requiredMigrations??[])requireFile(p);

const guidedManifest=json("release/zgirl-v3.12-guided-coach.json");
if(guidedManifest.release!=="3.12.0")errors.push(`Guided Coach baseline must remain 3.12.0; found ${guidedManifest.release}`);
if(guidedManifest.productionBaseline?.mainSha!=="695fe870fa14797154de790500fd2d95a9b936fc")errors.push("v3.12 production baseline changed; reconcile current main before release.");
for(const p of guidedManifest.requiredFiles??[])requireFile(p);

const priorManifestPath="release/zgirl-v3.11-operational-pilot.json";
requireFile(priorManifestPath);
const prior=fs.existsSync(path.join(root,priorManifestPath))?json(priorManifestPath):{};
for(const p of prior.requiredFiles??[])requireFile(p);
for(const p of prior.requiredMigrations??[])requireFile(p);
requireFile("release/zgirl-v3.10-release-train.json");

requireText("lib/release.ts",[/ZGIRL_RELEASE_VERSION\s*=\s*["']3\.14\.1["']/,/ZGIRL_RELEASE_TRAIN\s*=\s*["']v3\.14\.1-natural-ai-voice["']/,/approved-ai-voice-user-initiated/]);

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
requireText("components/institutions/GlsPilotCandidateQueue.tsx",[/GLS source-of-truth queue/,/does not carry participant reflection text/i,/Prepare governed Z-Girl workspace/,/Workspace gate locked/,/Preparing a workspace does not activate a live pilot/,/data-guide-target="gls-queue"/,/data-guide-target=\{index === 0 \? "gls-opportunity-card"/]);
requireText("app/api/institutions/ops/pilots/gls-prepare/route.ts",[/credentialSessionToken/,/zgirl_prepare_gls_pilot_workspace/,/pushGlsPilotImplementation/,/liveActivated:\s*false/,/retrySafe:\s*workspacePrepared/]);

const handoffMigration="supabase/migrations/20260819_zgirl_gls_qualification_activation_handoff_v3_13.sql";
requireText(handoffMigration,[/public\.zgirl_prepare_gls_pilot_workspace/,/private\.zgirl_operator_require_capability\(p_session_token,'pilot\.write'/,/safety_route_confirmed=false/,/revoke all on function public\.zgirl_prepare_gls_pilot_workspace\(text,uuid\) from public/,/grant execute on function public\.zgirl_prepare_gls_pilot_workspace\(text,uuid\) to anon, authenticated/]);
const handoffSrc=read(handoffMigration);
for(const forbidden of [/participant_name\s+text/i,/participant_email\s+text/i,/private_reflection\s+text/i,/reflection_text\s+text/i,/diagnosis\s+text/i,/clinical_note\s+text/i,/payment_card\s+text/i])if(forbidden.test(handoffSrc))errors.push(`v3.13 handoff contains prohibited participant/private field pattern: ${forbidden}`);

const releaseMigration="supabase/migrations/20260824_zgirl_human_readiness_release_evidence_v3_14.sql";
const releaseIndexMigration="supabase/migrations/20260824_zgirl_human_readiness_release_evidence_v3_14_index_hardening.sql";
requireText(releaseMigration,[
 /public\.zgirl_pilot_release_evidence/,
 /public\.zgirl_pilot_readiness_decisions/,
 /alter table public\.zgirl_pilot_release_evidence enable row level security/,
 /alter table public\.zgirl_pilot_readiness_decisions enable row level security/,
 /revoke all on public\.zgirl_pilot_release_evidence, public\.zgirl_pilot_readiness_decisions[\s\S]*from public, anon, authenticated/,
 /private\.zgirl_pilot_release_gate_summary/,
 /private\.zgirl_pilot_release_operational_summary/,
 /public\.zgirl_pilot_save_release_evidence/,
 /public\.zgirl_pilot_finalize_readiness_decision/,
 /named_release_reviewer_required/,
 /named_release_decision_maker_required/,
 /human_release_acknowledgement_required/,
 /test_pilot_release_prohibited/,
 /test_pilot_live_release_prohibited/,
 /human_live_release_required/,
 /release_authorized/,
 /decision in \('ready','ready_with_conditions','not_ready'\)/,
 /grant execute on function public\.zgirl_pilot_save_release_evidence\(text,uuid,text,text,text,text\)[\s\S]*to anon, authenticated/,
 /grant execute on function public\.zgirl_pilot_finalize_readiness_decision\(text,uuid,text,text,text,boolean,boolean\)[\s\S]*to anon, authenticated/
]);
requireText(releaseIndexMigration,[
 /zgirl_pilot_release_evidence_reviewer_idx/,
 /zgirl_pilot_readiness_decisions_actor_idx/,
 /zgirl_pilot_readiness_decisions_supersedes_idx/
]);
const releaseMigrationSrc=read(releaseMigration);
for(const forbidden of [/participant_name\s+text/i,/participant_email\s+text/i,/private_reflection\s+text/i,/reflection_text\s+text/i,/diagnosis\s+text/i,/clinical_note\s+text/i,/counseling_note\s+text/i,/safeguarding_narrative\s+text/i])if(forbidden.test(releaseMigrationSrc))errors.push(`v3.14 release workflow contains prohibited participant/private field pattern: ${forbidden}`);

requireText("app/api/institutions/ops/pilots/action/route.ts",[/save_release_evidence/,/finalize_readiness_decision/,/humanAcknowledged/,/credentialRpc/]);
requireText("components/institutions/PilotReleaseGatePanel.tsx",[/Evidence first\. Human decision last\./,/Ready with conditions/,/Authorize real live-pilot release/,/No private reflection content/,/Finalize immutable decision/]);
requireText("components/institutions/PilotReleaseDecisionReceipt.tsx",[/Human Readiness & Release Decision/,/Print \/ Save PDF/,/Live release/,/Data boundary/]);
requireText("app/institutions/ops/pilots/[id]/release-decision/page.tsx",[/Human release evidence · v3\.14/,/Readiness Decision Receipt/]);
requireText("docs/ZGIRL_V3_14_HUMAN_READINESS_RELEASE_EVIDENCE.md",[/Ready with conditions/,/append-only/i,/cannot receive real release authorization/i,/No commercial event, automation, checklist total, or system recommendation can make a pilot live/i]);

// Commerce remains separate from training and still seller-first.
requireText("lib/commerce.ts",[/if\s*\(!getSellerName\(\)\)\s*return\s+null/,/ZGIRL_CHECKOUT_LINKS_JSON/,/url\.protocol\s*!==\s*["']https:["']/]);
const checkoutOfferCount=(read("lib/commerce.ts").match(/mode:\s*["']checkout["']/g)??[]).length;
if(checkoutOfferCount!==4)errors.push(`Expected unchanged four-offer checkout gate; found ${checkoutOfferCount}`);

// Guided Coach implementation, professional narration filter, and Show-on-page visibility boundary.
const coachPath="components/institutions/InstitutionGuidedCoach.tsx";
requireText(coachPath,[
 /usePathname/,
 /@\/app\/lib\/voice/,
 /pickVoice/,
 /curateNarrationVoices/,
 /SpeechSynthesisUtterance/,
 /onClick=\{speak\}/,
 /Show captions\/transcript/,
 /Audio never starts automatically/,
 /\/api\/institutions\/ops\/identity\/dashboard/,
 /\/api\/institutions\/ops\/pilots\/gls-candidates/,
 /localStorage/,
 /Guide Me/,
 /Command Center map/,
 /Full orientation/,
 /Show on page/,
 /Return to Guide/,
 /setOpen\(false\)/,
 /bright teal outline/i
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
requireText("app/institutions/ops/pilots/page.tsx",[/v3\.14/,/Guided orientation/,/data-guide-target="pilot-operations"/]);
requireText("components/institutions/InstitutionOperatorAccess.tsx",[/data-guide-target="auth-mode"/]);
requireText("app/lib/voice.ts",[/NATURAL_HINTS/,/FEMININE_HINTS/,/DISTRACTING_NARRATION_HINTS/,/isSuitableNarrationVoice/,/curateNarrationVoices/,/rankVoices/,/pickVoice/]);
requireText("docs/ZGIRL_V3_12_COMMAND_CENTER_GUIDED_COACH.md",[/Listen → See → Do → Confirm/,/never autoplays audio/i,/Completion is a usability marker only/,/must never narrate or intentionally capture/i]);

// v3.14.1 live Coach voice is server-generated, disclosed, stateless and product-owner approved.
const liveVoiceRoute="app/api/voice/speech/route.ts";
requireText(liveVoiceRoute,[
 /gemini-3\.1-flash-tts-preview/,
 /zgirl-live-coach-en-us-v1/,
 /const VOICE = ["']Sulafat["']/,
 /GEMINI_API_KEY/,
 /store:\s*false/,
 /providerStorageDisabled:\s*true/,
 /humanListeningApproved:\s*true/,
 /publicReleaseApproved:\s*true/,
 /Cache-Control["']:\s*["']private, no-store/,
 /isSameOrigin/,
 /rateLimit/,
 /Pronounce “Z-Girl” as “Zee Girl/,
]);
const liveVoiceRouteSrc=read(liveVoiceRoute);
for(const forbidden of [/console\.(?:log|info|warn)\([^)]*(?:rawText|transcript)/,/store:\s*true/,/CEDAR/i,/BIGH?HAWK/i])if(forbidden.test(liveVoiceRouteSrc))errors.push(`Live Coach voice route contains a forbidden storage, identity or transcript-log pattern: ${forbidden}`);

const publicCoachPath="app/coach/page.tsx";
requireText(publicCoachPath,[
 /Z-Girl Natural AI Voice · Approved/,
 /AI-generated voice/,
 /Provider interaction storage is turned off/,
 /Playback never starts on its own/,
 /No robotic device voice was substituted/,
 /\/api\/voice\/speech/,
 /generatedVoiceAbortRef/,
 /URL\.revokeObjectURL/,
 /speechLang === ["']en-US["']/,
]);
const publicCoachSrc=read(publicCoachPath);
for(const forbidden of [/zgirlGreetingPlayed/,/Z-Girl Natural Voice · Recommended/,/autoPlay/i])if(forbidden.test(publicCoachSrc))errors.push(`Public Coach regressed its honest, user-initiated voice boundary: ${forbidden}`);
requireText("docs/ZGIRL_V3_14_1_NATURAL_AI_VOICE_CANDIDATE.md",[/product-owner listening approval/i,/store: false/,/iPhone/,/does not publish, replace or bypass/i,/v3\.14 human release gates remain authoritative/i]);

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
if(errors.length){for(const error of errors)console.error(`ERROR: ${error}`);console.error(`v3.14.1 verification failed with ${errors.length} error(s).`);process.exit(1);}
console.log(`Z-Girl v3.14.1 approved natural AI voice verification passed for ${pkg.version}.`);
console.log(`Initial guide coverage: ${(guidedManifest.initialCoverage??[]).length}`);
console.log(`Required Guided Coach files: ${(guidedManifest.requiredFiles??[]).length}`);
console.log(`Known warnings: ${warnings.length}`);
