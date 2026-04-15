import { useState, useRef, useEffect } from 'react'

interface OTPInputProps {
  length?: number
  onComplete?: (otp: string) => void
}

const OTPInput = ({ length = 6, onComplete }: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/\D/g, '') // Only allow digits
    
    if (value.length > 1) {
      // Handle paste event
      const pastedData = value.slice(0, length).split('')
      const newOtp = [...otp]
      
      for (let i = 0; i < Math.min(pastedData.length, length - index); i++) {
        newOtp[index + i] = pastedData[i]
      }
      
      setOtp(newOtp)
      
      // Focus on the next empty input or last input
      const nextIndex = Math.min(index + pastedData.length, length - 1)
      const nextInput = inputRefs.current[nextIndex]
      if (nextInput) {
        nextInput.focus()
      }
      
      // Check if complete
      const otpString = newOtp.join('')
      if (otpString.length === length && onComplete) {
        onComplete(otpString)
      }
    } else {
      // Handle single character input
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Move to next input
      if (value && index < length - 1) {
        const nextInput = inputRefs.current[index + 1]
        if (nextInput) {
          nextInput.focus()
        }
      }
      
      // Check if complete
      const otpString = newOtp.join('')
      if (otpString.length === length && onComplete) {
        onComplete(otpString)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newOtp = [...otp]
      
      if (otp[index]) {
        // Clear current input
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        // Move to previous input and clear it
        const prevInput = inputRefs.current[index - 1]
        if (prevInput) {
          prevInput.focus()
        }
        newOtp[index - 1] = ''
        setOtp(newOtp)
      }
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = inputRefs.current[index - 1]
      if (prevInput) {
        prevInput.focus()
      }
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      
      // Focus on the next empty input or last filled input
      const nextIndex = Math.min(pastedData.length, length - 1)
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus()
      }
      
      // Check if complete
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData)
      }
    }
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="tap-target w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-surface-container-low rounded-lg border-2 border-outline-variant/30 focus:border-primary-container focus:ring-0 text-on-surface transition-all"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  )
}

export default OTPInput
