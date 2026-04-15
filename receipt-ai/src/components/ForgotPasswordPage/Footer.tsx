import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="mt-auto py-6 border-t border-outline-variant/10 bg-surface">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div 
          className="flex items-center gap-1.5 opacity-60 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <span className="material-symbols-outlined text-sm" data-icon="account_balance_wallet">
            account_balance_wallet
          </span>
          <span className="brand-font font-bold text-xs tracking-tight">receiptAI</span>
        </div>
        
        <div className="flex gap-6">
          <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1" href="#">
            Privacy
          </a>
          <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1" href="#">
            Terms
          </a>
          <a className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1" href="#">
            Help
          </a>
        </div>
        
        <p className="text-xs text-on-surface-variant/40 font-medium">© 2024 receiptAI</p>
      </div>
    </footer>
  )
}

export default Footer
