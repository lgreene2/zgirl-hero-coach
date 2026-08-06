import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
  async redirects() {
    return [
      {
        source: "/resources/ZGirl_Christian_Reflection_Starter_Pack.pdf",
        destination: "/resources/christian-reflection-starter-pack",
        permanent: false,
      },
      {
        source: "/resources/ZGirl_Congregation_Starter_Toolkit.pdf",
        destination: "/resources/congregation-starter-toolkit",
        permanent: false,
      },
      {
        source: "/resources/ZGirl_Catholic_Youth_Pilot_Concept_OnePager.pdf",
        destination: "/resources/catholic-youth-pilot-concept",
        permanent: false,
      },
      {
        source: "/resources/ZGirl_Catholic_Leadership_Meeting_Package.pdf",
        destination: "/resources/catholic-leadership-package",
        permanent: false,
      },
      {
        source: "/resources/Hero_Within_Athlete_Reflection_Starter_Pack.pdf",
        destination: "/resources/athlete-reflection-starter-pack",
        permanent: false,
      },
      {
        source: "/resources/Hero_Within_Coach_Toolkit.pdf",
        destination: "/resources/coach-toolkit",
        permanent: false,
      },
      {
        source: "/resources/Hero_Within_Team_Pilot_Sell_Sheet.pdf",
        destination: "/resources/team-pilot-sell-sheet",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/review/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/api/review/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
