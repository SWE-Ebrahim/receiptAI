interface InputFieldProps {
  label: string
  type: string
  placeholder: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputField = ({ 
  label, 
  type, 
  placeholder, 
  value,
  onChange
}: InputFieldProps) => {
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
    </div>
  )
}

export default InputField
