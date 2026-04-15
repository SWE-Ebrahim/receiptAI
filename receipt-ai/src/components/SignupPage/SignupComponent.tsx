import Header from './Header'
import LeftContent from './LeftContent'
import SignupForm from './SignupForm'
import Footer from './Footer'

const SignupComponent = () => {
  const handleSignup = (data: { name: string; email: string; password: string }) => {
    console.log('Signup data:', data)
    // TODO: Implement actual signup logic
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl w-full items-center">
          <LeftContent />
          <SignupForm onSubmit={handleSignup} />
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default SignupComponent
