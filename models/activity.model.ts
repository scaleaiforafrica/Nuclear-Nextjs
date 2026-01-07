// Activity model - Data types for activity tracking
export interface Activity {
  id: string
  time: string
  event: string
  type: ActivityType
}

export type ActivityType = 
  | 'delivery' 
  | 'procurement' 
  | 'customs' 
  | 'alert' 
  | 'approval'
