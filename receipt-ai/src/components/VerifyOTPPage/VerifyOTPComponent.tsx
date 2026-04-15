import Header from './Header'
import VerifyOTPForm from './VerifyOTPForm'
import Footer from './Footer'

const VerifyOTPComponent = () => {
  const handleVerifySuccess = () => {
    console.log('✅ OTP verified successfully!')
    // TODO: Navigate to dashboard or login
    window.location.href = '/login'
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
