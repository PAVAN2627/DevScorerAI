import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-3 text-muted-foreground">Last updated: March 23, 2026</p>

        <div className="mt-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Information We Collect</h2>
            <p className="mt-2">We may collect account information (email), uploaded profile documents, and analysis outputs to provide the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">How We Use Information</h2>
            <p className="mt-2">We use data only to run analyses, store your history, and improve your experience in the product.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Data Security</h2>
            <p className="mt-2">We use authenticated access and database security rules to protect user data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p className="mt-2">For privacy questions, contact the DevScorerAI team.</p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
