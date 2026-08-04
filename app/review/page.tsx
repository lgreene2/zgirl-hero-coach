import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authorizedReviewLocale } from "@/app/review/auth";
import ReviewerWorkspace from "@/app/review/ReviewerWorkspace";

export const metadata: Metadata = {
  title: "Native-language review workspace",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ReviewPage() {
  const authorizedLocale = await authorizedReviewLocale();
  if (!authorizedLocale) redirect("/review/login");
  return <ReviewerWorkspace authorizedLocale={authorizedLocale} />;
}
