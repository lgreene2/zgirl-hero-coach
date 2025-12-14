export const FEATURES = {
  FREE: {
    heroMomentsLimit: 3,
    videoScriptLimit: 1,
  },
  ZGIRL_PLUS: {
    heroMomentsLimit: "unlimited",
    videoScriptLimit: "unlimited",
    audioReplay: true,
    heroPaths: true,
    seasonalModes: true,
  },
} as const;
