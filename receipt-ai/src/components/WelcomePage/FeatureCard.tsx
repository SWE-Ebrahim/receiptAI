interface FeatureCardProps {
  icon: string
  title: string
  description: string
  delay?: number  // 0, 1, or 2 (maps to mt-0, mt-4, mt-8)
}

const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  const marginClass = delay === 0 ? 'md:mt-0' : delay === 1 ? 'md:mt-4' : 'md:mt-8'
  
  return (
    <div 
      className={`bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10 flex flex-col gap-4 hover:scale-[1.02] transition-transform ${marginClass}`}
    >
      <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
        <span className="material-symbols-outlined text-primary" data-icon={icon}>{icon}</span>
      </div>
      <h3 className="font-headline text-xl font-bold text-on-surface">{title}</h3>
      <p className="text-on-surface-variant text-sm">{description}</p>
    </div>
  )
}

export default FeatureCard