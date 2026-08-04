import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isReviewAuthorized } from "@/app/review/auth";
import ReviewerWorkspace from "@/app/review/ReviewerWorkspace";

export const metadata: Metadata = {
  title: "Native-language review workspace",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ReviewPage() {
  if (!(await isReviewAuthorized())) redirect("/review/login");
  return <ReviewerWorkspace />;
}
