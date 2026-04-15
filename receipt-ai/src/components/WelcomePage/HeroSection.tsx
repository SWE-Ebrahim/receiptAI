import { useNavigate } from 'react-router-dom'

interface HeroSectionProps {
  title?: string
  description?: string
  ctaText?: string
}

const HeroSection = ({
  title = "Scan Receipts. Save Time. Master Your Money.",
  description = "The Digital Curator for your financial life. AI-powered extraction that turns paper clutter into actionable insights.",
  ctaText = "Get Started"
}: HeroSectionProps) => {
  const navigate = useNavigate()

  return (
    <section className="px-6 py-16 md:py-24 max-w-screen-xl mx-auto">
      <div className="flex flex-col gap-8 items-center text-center">
        <div className="space-y-4 max-w-3xl">
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface leading-tight">
            Scan Receipts. <br />
            Save Time. <br />
            <span className="text-primary italic">Master Your Money.</span>
          </h1>
          <p className="max-w-md mx-auto text-on-surface-variant text-lg leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button 
            onClick={() => navigate('/signup')}
            className="hero-gradient text-on-primary px-8 py-4 rounded-full font-headline font-bold text-lg shadow-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            {ctaText}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="relative w-full max-w-2xl mt-8">
          <div className="absolute inset-0 bg-primary-container/20 blur-3xl -z-10 rounded-full"></div>
          <img 
            alt="Digital interface for scanning receipts" 
            className="rounded-xl shadow-2xl border-8 border-surface-container-lowest w-full h-auto" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8faPVSv9NKkEniwLh65BePT_asy_dcbxrslZVqbomR9fvP1T-N9f3qs-h45enOvscyoVMj8xC4cTGFjGCb0Zll-qY2AGevGq1aHAaRUNxnrIVR3wp79-qaZwzBdOs6fefsciU9XEgT4vcuFk8A5xV0_dTSKobnMQ8xeQjL2x6u2WPp3XTvUjuzPmgI7i48bD5Tizeh0EdxJSGWtdCM5fWfsSE55DIYy3M1jBWDAuKwLwrkfbXY52DextEh2vNVbAAVZMIW4QTUFz9"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
