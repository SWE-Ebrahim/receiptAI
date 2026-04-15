import TimelineStep from './TimelineStep'

const HowItWorksSection = () => {
  return (
    <section className="px-6 py-20 max-w-screen-xl mx-auto">
      <h2 className="font-headline text-3xl font-bold text-center mb-16 text-on-surface">Effortless Flow</h2>
      <div className="relative max-w-md mx-auto">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-outline-variant/20"></div>
        <div className="space-y-12">
          <TimelineStep 
            stepNumber={1}
            icon="photo_camera"
            title="Scan"
            description="Snap a photo of any receipt. Our lens handles the rest, even in low light."
            bgColor="bg-primary"
            textColor="text-on-primary"
          />
          <TimelineStep 
            stepNumber={2}
            icon="data_exploration"
            title="Extract"
            description="AI identifies data points automatically. No manual entry ever again."
            bgColor="bg-primary-container"
            textColor="text-on-primary-container"
          />
          <TimelineStep 
            stepNumber={3}
            icon="insights"
            title="Analyze"
            description="Review your spending by category and export perfectly formatted reports."
            bgColor="bg-secondary-container"
            textColor="text-on-secondary-container"
          />
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
