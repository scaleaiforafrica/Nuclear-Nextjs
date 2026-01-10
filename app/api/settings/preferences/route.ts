import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  
  // Validate and sanitize input
  const allowedFields = [
    'timezone', 
    'date_format', 
    'theme',
    'email_notifications',
    'push_notifications',
    'in_app_notifications',
    'shipment_alerts',
    'compliance_reminders',
    'daily_digest',
    'weekly_digest'
  ]
  
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
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ profile: data })
}
