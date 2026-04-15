import { useNavigate } from 'react-router-dom'

const SecondaryCTA = () => {
  const navigate = useNavigate()

  return (
    <section className="px-6 py-16">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-emerald-900 rounded-xl p-10 text-center relative overflow-hidden">
          {/* Background Decorative Gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary rounded-full blur-[80px] opacity-30"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="font-headline text-3xl font-bold text-on-primary">
              Join thousands of smart spenders today.
            </h2>
            <p className="text-primary-fixed/80 max-w-sm mx-auto">
              Start your 14-day free trial. No credit card required. Experience the digital curator.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-primary-fixed text-on-primary-fixed px-8 py-4 rounded-full font-headline font-bold text-lg hover:scale-105 transition-transform"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SecondaryCTA