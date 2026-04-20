import Header from './Header'
import VerifyOTPForm from './VerifyOTPForm'
import Footer from './Footer'

const VerifyOTPComponent = () => {
  const handleVerifySuccess = () => {
    console.log('✅ OTP verified successfully!')
    // User will be redirected to dashboard by VerifyOTPForm
    // No need to redirect here
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col light">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full flex items-center justify-center">
          <VerifyOTPForm onVerifySuccess={handleVerifySuccess} />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default VerifyOTPComponent
