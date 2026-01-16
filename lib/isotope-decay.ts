/**
 * Isotope Decay Calculations
 * Provides utilities for calculating radioactive decay of medical isotopes
 */

/**
 * Isotope half-lives in hours
 * Data from nuclear medicine references
 */
export const ISOTOPE_HALF_LIVES: Record<string, number> = {
  'Tc-99m': 6.0,        // Technetium-99m: 6.02 hours
  'I-131': 192.0,       // Iodine-131: 8.02 days (192 hours)
  'F-18': 1.83,         // Fluorine-18: 109.8 minutes (1.83 hours)
  'Lu-177': 6.73 * 24,  // Lutetium-177: 6.73 days (161.5 hours)
  'I-123': 13.2,        // Iodine-123: 13.2 hours
  'Ga-68': 1.13,        // Gallium-68: 67.7 minutes (1.13 hours)
  'Y-90': 64.0,         // Yttrium-90: 64.0 hours
  'Sm-153': 46.5,       // Samarium-153: 46.5 hours
  'Ra-223': 11.43 * 24, // Radium-223: 11.43 days (274 hours)
  'In-111': 2.8 * 24,   // Indium-111: 2.8 days (67 hours)
};

/**
 * Calculate radioactive decay using the decay formula:
 * A(t) = A₀ × (1/2)^(t/t½)
 * 
 * @param initialActivity - Initial activity at time zero (mCi or GBq)
 * @param halfLife - Half-life of the isotope in hours
 * @param elapsedTime - Time elapsed in hours
 * @returns Current activity after decay
 */
export function calculateDecay(
  initialActivity: number,
  halfLife: number,
  elapsedTime: number
): number {
  if (initialActivity <= 0 || halfLife <= 0) {
    return 0;
  }
  
  // A(t) = A₀ × (1/2)^(t/t½)
  const currentActivity = initialActivity * Math.pow(0.5, elapsedTime / halfLife);
  
  // Round to 2 decimal places
  return Math.round(currentActivity * 100) / 100;
}

/**
 * Calculate current activity of an isotope based on time elapsed since shipment
 * 
 * @param initialActivity - Initial activity at shipment (mCi or GBq)
 * @param isotope - Isotope name (e.g., 'Tc-99m', 'I-131')
 * @param elapsedHours - Hours elapsed since shipment started
 * @returns Current activity after decay
 */
export function calculateCurrentActivity(
  initialActivity: number,
  isotope: string,
  elapsedHours: number
): number {
  const halfLife = ISOTOPE_HALF_LIVES[isotope];
  
  if (!halfLife) {
    console.warn(`Unknown isotope: ${isotope}. Using initial activity.`);
    return initialActivity;
  }
  
  return calculateDecay(initialActivity, halfLife, elapsedHours);
}

/**
 * Calculate expected activity at arrival based on delivery time
 * 
 * @param initialActivity - Initial activity at shipment origin
 * @param isotope - Isotope name
 * @param deliveryTimeStr - Delivery time string (e.g., "24 hours", "48 hours", "3 days")
 * @returns Expected activity at arrival
 */
export function calculateActivityAtArrival(
  initialActivity: number,
  isotope: string,
  deliveryTimeStr: string
): number {
  const deliveryHours = parseDeliveryTime(deliveryTimeStr);
  return calculateCurrentActivity(initialActivity, isotope, deliveryHours);
}

/**
 * Parse delivery time string to hours
 * Supports formats: "24 hours", "2 days", "48 hours", etc.
 * 
 * @param deliveryTimeStr - Delivery time string
 * @returns Number of hours
 */
export function parseDeliveryTime(deliveryTimeStr: string): number {
  const str = deliveryTimeStr.toLowerCase().trim();
  
  // Match patterns like "24 hours", "2 days", "48h", "3d"
  const hoursMatch = str.match(/(\d+\.?\d*)\s*(hours?|hrs?|h)/);
  const daysMatch = str.match(/(\d+\.?\d*)\s*(days?|d)/);
  
  if (hoursMatch) {
    return parseFloat(hoursMatch[1]);
  }
  
  if (daysMatch) {
    return parseFloat(daysMatch[1]) * 24;
  }
  
  // Default to 24 hours if can't parse
  console.warn(`Could not parse delivery time: ${deliveryTimeStr}. Using 24 hours.`);
  return 24;
}

/**
 * Calculate time elapsed between two timestamps
 * 
 * @param startTime - Start timestamp (ISO string or Date)
 * @param endTime - End timestamp (ISO string or Date), defaults to now
 * @returns Hours elapsed
 */
export function calculateElapsedHours(
  startTime: string | Date,
  endTime?: string | Date
): number {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  
  const millisElapsed = end - start;
  const hoursElapsed = millisElapsed / (1000 * 60 * 60);
  
  return Math.max(0, hoursElapsed);
}

/**
 * Calculate decay percentage (how much activity has been lost)
 * 
 * @param initialActivity - Initial activity
 * @param currentActivity - Current activity
 * @returns Percentage of activity lost (0-100)
 */
export function calculateDecayPercentage(
  initialActivity: number,
  currentActivity: number
): number {
  if (initialActivity <= 0) return 0;
  
  const decayPercentage = ((initialActivity - currentActivity) / initialActivity) * 100;
  return Math.round(decayPercentage * 100) / 100;
}

/**
 * Calculate remaining percentage of initial activity
 * 
 * @param initialActivity - Initial activity
 * @param currentActivity - Current activity
 * @returns Percentage of activity remaining (0-100)
 */
export function calculateRemainingPercentage(
  initialActivity: number,
  currentActivity: number
): number {
  if (initialActivity <= 0) return 0;
  
  const remainingPercentage = (currentActivity / initialActivity) * 100;
  return Math.round(remainingPercentage * 100) / 100;
}

/**
 * Get isotope half-life in a human-readable format
 * 
 * @param isotope - Isotope name
 * @returns Formatted half-life string
 */
export function getFormattedHalfLife(isotope: string): string {
  const halfLife = ISOTOPE_HALF_LIVES[isotope];
  
  if (!halfLife) {
    return 'Unknown';
  }
  
  if (halfLife < 2) {
    // Less than 2 hours, show in minutes
    const minutes = Math.round(halfLife * 60);
    return `${minutes} minutes`;
  } else if (halfLife < 48) {
    // Less than 48 hours, show in hours
    return `${halfLife.toFixed(1)} hours`;
  } else {
    // Show in days
    const days = (halfLife / 24).toFixed(1);
    return `${days} days`;
  }
}

/**
 * Estimate time until activity drops below a threshold
 * 
 * @param initialActivity - Initial activity
 * @param isotope - Isotope name
 * @param thresholdActivity - Target threshold activity
 * @returns Hours until activity drops below threshold, or -1 if never
 */
export function estimateTimeToThreshold(
  initialActivity: number,
  isotope: string,
  thresholdActivity: number
): number {
  const halfLife = ISOTOPE_HALF_LIVES[isotope];
  
  if (!halfLife || initialActivity <= thresholdActivity) {
    return 0;
  }
  
  // Solve: threshold = initial × (1/2)^(t/halfLife)
  // t = halfLife × log₂(initial/threshold)
  // t = halfLife × (ln(initial/threshold) / ln(2))
  
  const ratio = initialActivity / thresholdActivity;
  const time = halfLife * (Math.log(ratio) / Math.log(2));
  
  return Math.round(time * 100) / 100;
}
