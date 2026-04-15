interface InputFieldProps {
  label: string
  type: string
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  showStrength?: boolean
  strengthLevel?: number
  helperText?: string
}

const InputField = ({ 
  label, 
  type, 
  placeholder, 
  value,
  onChange,
  showStrength = false,
  strengthLevel = 0,
  helperText
}: InputFieldProps) => {
  // Calculate password requirements
  const hasMinLength = (value?.length || 0) >= 8
  const hasUppercase = /[A-Z]/.test(value || '')
  const hasNumber = /[0-9]/.test(value || '')
  const hasSpecial = /[^A-Za-z0-9]/.test(value || '')

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-4">
        {label}
      </label>
      <input 
        className="tap-target w-full px-6 py-3.5 bg-surface-container-low rounded-full border-2 border-transparent focus:border-primary-container focus:ring-0 text-on-surface placeholder:text-on-surface-variant/40 transition-all text-sm"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
      
      {showStrength && value && (
        <>
          {/* Strength Bar */}
          <div className="mt-3 px-6 flex items-center justify-between">
            <div className="flex gap-1.5 h-1.5 w-3/4">
              {[1, 2, 3, 4].map((level) => (
                <div 
                  key={level}
                  className={`flex-1 rounded-full transition-all ${
                    level <= strengthLevel 
                      ? strengthLevel === 4 
                        ? 'bg-green-500' 
                        : strengthLevel === 3 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      : 'bg-surface-dim'
                  }`}
                ></div>
              ))}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider ${
              strengthLevel === 4 ? 'text-green-600' : 
              strengthLevel === 3 ? 'text-yellow-600' : 
              strengthLevel === 2 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {strengthLevel === 4 ? 'Strong' : strengthLevel === 3 ? 'Good' : strengthLevel === 2 ? 'Fair' : 'Weak'}
            </span>
          </div>

          {/* Requirements List */}
          <div className="px-6 mt-2 space-y-1">
            <p className={`text-[10px] flex items-center gap-1 ${hasMinLength ? 'text-green-600' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-xs">{hasMinLength ? 'check_circle' : 'radio_button_unchecked'}</span>
              At least 8 characters
            </p>
            <p className={`text-[10px] flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-xs">{hasUppercase ? 'check_circle' : 'radio_button_unchecked'}</span>
              One uppercase letter
            </p>
            <p className={`text-[10px] flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-xs">{hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
              One number
            </p>
            <p className={`text-[10px] flex items-center gap-1 ${hasSpecial ? 'text-green-600' : 'text-on-surface-variant'}`}>
              <span className="material-symbols-outlined text-xs">{hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
              One special character
            </p>
          </div>
        </>
      )}
      {helperText && !showStrength && (
        <p className="text-[10px] text-on-surface-variant/60 ml-4">{helperText}</p>
      )}
    </div>
  )
}

export default InputField
