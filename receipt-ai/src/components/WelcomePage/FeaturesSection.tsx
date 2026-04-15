import FeatureCard from './FeatureCard'

const FeaturesSection = () => {
  return (
    <section className="px-6 py-16 bg-surface-container-low">
      <div className="max-w-screen-xl mx-auto space-y-12">
        <div className="text-center md:text-left">
          <h2 className="font-headline text-3xl font-bold text-on-surface">Intelligent Curation</h2>
          <p className="text-on-surface-variant">Beyond simple scanning—pure precision.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon="auto_awesome"
            title="Smart AI Scanning"
            description="Instant extraction of merchant names, dates, and line-item totals with 99% accuracy."
            delay={0}
          />
          <FeatureCard 
            icon="picture_as_pdf"
            title="Instant PDF Reports"
            description="Generate professional, tax-ready summaries and expense reports in just one tap."
            delay={1}  // 16px offset
          />
          <FeatureCard 
            icon="bar_chart"
            title="Smart Analytics"
            description="Visualize spending patterns with ease through curated financial dashboards."
            delay={2}  // 32px offset
          />
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection