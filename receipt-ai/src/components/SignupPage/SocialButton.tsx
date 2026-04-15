interface SocialButtonProps {
  icon: string
  label: string
  onClick?: () => void
  imageSrc?: string
}

const SocialButton = ({ icon, label, onClick, imageSrc }: SocialButtonProps) => {
  return (
    <button 
      className="tap-target flex items-center justify-center gap-3 py-4 px-6 rounded-full border-2 border-outline-variant/30 hover:bg-surface-container-low transition-all duration-200 active:scale-95"
      onClick={onClick}
      type="button"
    >
      {imageSrc ? (
        <img alt={label} className="w-6 h-6" src={imageSrc} />
      ) : (
        <span className="material-symbols-outlined text-2xl" data-icon={icon}>
          {icon}
        </span>
      )}
      <span className="text-base font-bold text-on-surface">{label}</span>
    </button>
  )
}

export default SocialButton
