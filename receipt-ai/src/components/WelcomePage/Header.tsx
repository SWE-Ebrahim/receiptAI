import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-low/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-1.5 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined text-primary text-xl transition-transform group-hover:scale-110" data-icon="account_balance_wallet">
            account_balance_wallet
          </span>
          <span className="font-headline font-extrabold text-lg text-on-surface tracking-tight italic">
            receiptAI
          </span>
        </div>
        
        <button 
          onClick={() => navigate('/signup')}
          className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-bold text-sm hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Get Started
        </button>
      </div>
    </header>
  )
}

export default Header