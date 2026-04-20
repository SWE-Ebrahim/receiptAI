import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="w-full mt-12 border-t border-outline-variant/10 bg-surface rounded-t-[2.5rem]">
      <div className="max-w-screen-xl mx-auto px-4 py-12 flex flex-col items-center gap-6">
        <div 
          className="flex items-center gap-1.5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined text-primary text-sm" data-icon="account_balance_wallet">
            account_balance_wallet
          </span>
          <span className="font-headline font-bold text-sm tracking-tight text-on-surface">
            receiptAI
          </span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          <a 
            href="#" 
            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            About
          </a>
          <a 
            href="#" 
            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Contact
          </a>
          <a 
            href="#" 
            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Privacy
          </a>
          <a 
            href="#" 
            className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1"
          >
            Security
          </a>
        </div>
        
        <p className="text-xs text-on-surface-variant/40 font-medium">
          © 2026 receiptAI. The Digital Curator.
        </p>
      </div>
    </footer>
  )
}

export default Footer