import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { current_password, new_password } = await request.json()
  
  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: 'Current password and new password are required' },
      { status: 400 }
    )
  }
  
  if (new_password.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters long' },
      { status: 400 }
    )
  }
  
  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  })
  
  if (signInError) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 401 }
    )
  }
  
  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: new_password,
  })
  
  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ success: true, message: 'Password updated successfully' })
}
