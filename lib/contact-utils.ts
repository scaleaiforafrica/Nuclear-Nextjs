/**
 * Contact information and utilities for generating contact links
 */

export const CONTACT_INFO = {
  email: 'scaleaiforafrica@gmail.com',
  phone: '+263 78544753',
} as const;

/**
 * Generates a mailto link for scheduling a demo
 */
export function getScheduleDemoMailtoLink(): string {
  const subject = encodeURIComponent('Schedule Demo Request');
  const body = encodeURIComponent(
    `Hello,\n\nI would like to schedule a demo of NuclearFlow.\n\nYou can also reach us at: ${CONTACT_INFO.phone}`
  );
  return `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
}

/**
 * Generates a mailto link for contacting sales
 */
export function getContactSalesMailtoLink(): string {
  const subject = encodeURIComponent('Contact Sales Inquiry');
  const body = encodeURIComponent(
    `Hello,\n\nI would like to learn more about NuclearFlow.\n\nYou can also reach us at: ${CONTACT_INFO.phone}`
  );
  return `mailto:${CONTACT_INFO.email}?subject=${subject}&body=${body}`;
}
