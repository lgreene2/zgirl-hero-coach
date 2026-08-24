import { NextResponse } from "next/server";
import { ZGIRL_RELEASE_BOUNDARY, ZGIRL_RELEASE_TRAIN, ZGIRL_RELEASE_VERSION } from "@/lib/release";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const gitCommit = process.env.VERCEL_GIT_COMMIT_SHA?.trim() || null;
  const environment = process.env.VERCEL_ENV?.trim() || null;

  return NextResponse.json(
    {
      version: ZGIRL_RELEASE_VERSION,
      releaseTrain: ZGIRL_RELEASE_TRAIN,
      boundary: ZGIRL_RELEASE_BOUNDARY,
      gitCommit,
      environment,
      commerceGateSeparate: true,
      participantPrivateReflectionAdminAccess: false,
      livePilotHumanDecisionRequired: true,
      humanDecisionAutoAdvancesStage: false,
      testPilotLiveReleaseAllowed: false,
      naturalAiVoiceCandidate: false,
      naturalAiVoiceLanguage: "en-US",
      naturalAiVoiceHumanListeningRequired: true,
      naturalAiVoiceHumanListeningApproved: true,
      naturalAiVoicePublicReleaseApproved: true,
      naturalAiVoiceAutoplay: false,
      naturalAiVoiceDeviceFallback: false,
      nonCandidateLanguagesUseDeviceVoice: true,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
