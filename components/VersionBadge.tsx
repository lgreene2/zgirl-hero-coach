export default function VersionBadge() {
  const v = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
  return (
    <span className="text-[10px] opacity-60 select-none">
      v{v}
    </span>
  );
}
