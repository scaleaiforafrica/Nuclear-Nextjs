'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth.context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DEMO_ACCOUNT_EMAIL, DEMO_CONFIG } from '@/lib/demo/config'

export default function LoginPage() {
  const router = useRouter()
  const { login, signUp, resetPassword } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    const result = await login(email, password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)
    
    const result = await signUp(email, password)
    
    if (result.success) {
      setMessage('Check your email for the confirmation link!')
    } else {
      setError(result.error || 'Sign up failed')
    }
    setIsLoading(false)
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setError('')
    setMessage('')
    setIsLoading(true)
    
    const result = await resetPassword(email)
    
    if (result.success) {
      setMessage('Check your email for the password reset link!')
    } else {
      setError(result.error || 'Failed to send reset email')
    }
    setIsLoading(false)
  }

  const handleTryDemo = async () => {
    setError('')
    setMessage('')
    setIsLoading(true)
    
    const result = await login(DEMO_ACCOUNT_EMAIL, DEMO_CONFIG.account.password)
    
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError('Demo account unavailable. Please try again later.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-heading flex items-center justify-center gap-2">
            <img src="/images/nuclear-logo.png" alt="Nuclear logo" loading="eager" className="w-24 h-24" />
            NUCLEAR
          </CardTitle>
          <CardDescription>Nuclear Supply Chain Management</CardDescription>
        </CardHeader>
        
        {/* Demo Mode Button */}
        <div className="px-4 pb-4">
          <Button
            variant="outline"
            className="w-full border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
            onClick={handleTryDemo}
            disabled={isLoading}
          >
            <span className="mr-2">🚀</span>
            Try Demo Account
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Explore with sample data from African healthcare facilities
          </p>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4" style={{ width: 'calc(100% - 2rem)' }}>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && <p className="text-sm text-secondary">{message}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {message && <p className="text-sm text-secondary">{message}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
