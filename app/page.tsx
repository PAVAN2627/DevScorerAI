import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <section className="py-14 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border/50 bg-card/50 p-6 md:p-10 backdrop-blur-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Demo and Project Resources</h2>
          <p className="mt-2 text-muted-foreground">
            Explore the live product, watch the demo, and open the project presentation.
          </p>

          <div className="mt-6 flex flex-col gap-3 text-sm md:text-base">
            <Link href="https://dev-scorer-ai.vercel.app/" target="_blank" className="text-primary hover:underline">
              Live App: https://dev-scorer-ai.vercel.app/
            </Link>
            <Link href="https://drive.google.com/file/d/1yKQ6oDgSNApJDpXqcFcri6IohSwt46cR/view?usp=sharing" target="_blank" className="text-primary hover:underline">
              Demo Video: Google Drive Link
            </Link>
            <Link href="https://drive.google.com/file/d/1WE6eZYzDkw6RfY5rY902QsAytAQzm9uA/view?usp=sharing" target="_blank" className="text-primary hover:underline">
              PPT: Google Drive Link
            </Link>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-border/60 bg-background/40">
            <iframe
              src="https://drive.google.com/file/d/1yKQ6oDgSNApJDpXqcFcri6IohSwt46cR/preview"
              title="DevScorerAI Demo Video"
              className="w-full h-[260px] sm:h-[360px] md:h-[460px]"
              allow="autoplay"
            />
          </div>
        </div>
      </section>
      <CTASection />
      <Footer />
    </main>
  )
}
