import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="w-full top-0 sticky z-50 bg-surface-container-low/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-outline-variant/10">
      <div 
        className="flex items-center gap-1.5 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <span className="material-symbols-outlined text-primary text-xl" data-icon="account_balance_wallet">
          account_balance_wallet
        </span>
        
        <span className="brand-font font-extrabold text-lg text-on-surface tracking-tighter">
          receiptAI
        </span>
      </div>
    </header>
  )
}

export default Header
