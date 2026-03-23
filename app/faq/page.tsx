import Link from "next/link"

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">FAQ</h1>
        <p className="mt-3 text-muted-foreground">Frequently asked questions about DevScorerAI.</p>

        <div className="mt-10 space-y-6">
          <section className="rounded-xl border border-border/50 bg-card/50 p-5">
            <h2 className="text-lg font-semibold text-foreground">What does DevScorerAI analyze?</h2>
            <p className="mt-2 text-sm text-muted-foreground">It analyzes Resume, LinkedIn, and GitHub profiles and gives score-based feedback.</p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card/50 p-5">
            <h2 className="text-lg font-semibold text-foreground">Do I need to pay to use it?</h2>
            <p className="mt-2 text-sm text-muted-foreground">No. The current version is available for demo and project use.</p>
          </section>

          <section className="rounded-xl border border-border/50 bg-card/50 p-5">
            <h2 className="text-lg font-semibold text-foreground">Is my data secure?</h2>
            <p className="mt-2 text-sm text-muted-foreground">User data is protected using Supabase authentication and database security policies.</p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
