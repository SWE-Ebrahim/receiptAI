interface LeftContentProps {
  title?: string
  subtitle?: string
}

const LeftContent = ({ 
  title = "The Fluid Accountant.",
  subtitle = "Join thousands of smart spenders today. Organize your financial life with editorial precision and AI-powered clarity."
}: LeftContentProps) => {
  return (
    <div className="hidden lg:block space-y-12">
      <div className="space-y-6">
        <h1 className="text-6xl font-extrabold text-on-surface tracking-tight leading-none">
          The Fluid <br />
          <span className="text-primary">Accountant.</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-md leading-relaxed">
          {subtitle}
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center gap-6 bg-surface-container-low p-6 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl" data-icon="receipt_long">
              receipt_long
            </span>
          </div>
          <div>
            <p className="font-bold text-lg text-on-surface">Instant Digitization</p>
            <p className="text-sm text-on-surface-variant">Snap a photo, let AI do the heavy lifting.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-surface-container-low p-6 rounded-2xl">
          <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl" data-icon="security">
              security
            </span>
          </div>
          <div>
            <p className="font-bold text-lg text-on-surface">Bank-Grade Vault</p>
            <p className="text-sm text-on-surface-variant">Your data is encrypted and always accessible.</p>
          </div>
        </div>
      </div>
      
      <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
        <img 
          alt="Financial Dashboard" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp3X24TW_XFD8eCiOkKB1_f_9K70ZlFVVlwHYb9oOPJUU2J-v5qZEN_-Ykf2wzIs_hkF_dU0yrTFYtaIg_7pKvanG2Eu4I5kmVSJc1v0X4qZIG2t5wsPrljfvGGAgw1U3FQhC5U423uOj9myq-uLbsz3F8y-ggsHJI-cJJl-EBqNurcJWzPi-ypzOSwWnLGljRJYE9C5vQhv5WpUT1bJCmMvnqHMB6G1HjHGl1IP0V-o4Q2Qb5TfTLLYc1dIadMe4otMRXGsSEb5oR"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-on-background/40 to-transparent"></div>
      </div>
    </div>
  )
}

export default LeftContent
