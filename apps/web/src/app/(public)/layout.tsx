import Header from "@/components/header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col" data-testid="public-layout">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 text-center text-muted-foreground text-xs">
        Geoveda &mdash; Supply chain traceability
      </footer>
    </div>
  );
}
