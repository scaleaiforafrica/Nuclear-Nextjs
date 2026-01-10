import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  // If no profile exists (PGRST116 is "no rows returned"), create one
  if (error && error.code === 'PGRST116') {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: user.user_metadata?.full_name || null,
        role: user.user_metadata?.role || 'Hospital Administrator',
        initials: user.user_metadata?.initials || user.email?.substring(0, 2).toUpperCase() || null,
      })
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    
    return NextResponse.json({ profile: newProfile })
  }
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ profile })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  
  // Validate and sanitize input
  const allowedFields = ['name', 'phone', 'job_title', 'department', 'avatar_url']
  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field]
    }
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
  
  // If no profile exists (PGRST116 is "no rows returned"), create one with the updates
  if (error && error.code === 'PGRST116') {
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: updates.name || user.user_metadata?.full_name || null,
        role: user.user_metadata?.role || 'Hospital Administrator',
        initials: user.user_metadata?.initials || user.email?.substring(0, 2).toUpperCase() || null,
        ...updates,
      })
      .select()
      .single()
    
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    
    return NextResponse.json({ profile: newProfile })
  }
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ profile: data })
}
