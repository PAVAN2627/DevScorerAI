import Link from "next/link"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Terms and Conditions</h1>
        <p className="mt-3 text-muted-foreground">Last updated: March 23, 2026</p>

        <div className="mt-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Acceptance of Terms</h2>
            <p className="mt-2">By using DevScorerAI, you agree to these terms and conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Use of Service</h2>
            <p className="mt-2">You may use this service for personal, academic, and demonstration purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Limitations</h2>
            <p className="mt-2">Analysis results are guidance only and do not guarantee job outcomes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Changes to Terms</h2>
            <p className="mt-2">We may update these terms as the product evolves.</p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
