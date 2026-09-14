export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-[#76ead6]/20 bg-[#071b25] px-4 py-3 text-center text-xs font-black uppercase tracking-[.14em] text-[#9bf2e7] sm:text-sm">
        No cost to express interest · Qualification required · Founding cohort benefits available
      </div>
      {children}
    </>
  );
}
