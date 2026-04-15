import Header from './Header'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import HowItWorksSection from './HowItWorksSection'
import SecondaryCTA from './SecondaryCTA'
import Footer from './Footer'

const WelcomeComponent = () => {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-secondary-container min-h-screen light">
      <Header />
      <main className="pt-24 overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SecondaryCTA />
      </main>
      <Footer />
    </div>
  )
}

export default WelcomeComponent
