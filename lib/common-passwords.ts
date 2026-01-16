/**
 * Common Passwords List
 * 
 * A curated list of the most commonly used passwords to prevent weak password selection.
 * Based on security research and common password databases.
 */

export const COMMON_PASSWORDS = [
  // Top 100 most common passwords
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  '111111',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
  'welcome',
  'jesus',
  'ninja',
  'mustang',
  'password1',
  '123456789',
  'password123',
  '12345',
  'qwerty123',
  '1q2w3e4r',
  'admin',
  'Password',
  '1234',
  'abc123',
  'password!',
  'Password1',
  'Password123',
  'admin123',
  'root',
  'toor',
  'pass',
  'test',
  'guest',
  'demo',
  'user',
  'changeme',
  'welcome1',
  'welcome123',
  'login',
  'access',
  'secret',
  'password1234',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  '1qaz2wsx',
  'qwer1234',
  'jordan',
  'charlie',
  'batman',
  'jennifer',
  'cookie',
  'thomas',
  'robert',
  'test123',
  'admin1',
  'administrator',
  'welcome2',
  'hello',
  'hello123',
  'qwerty1',
  'qwerty12',
  'starwars',
  'pokemon',
  'computer',
  'internet',
  'gaming',
  'killer',
  'harley',
  'ranger',
  'jordan23',
  'freedom',
  'whatever',
  'nicholas',
  'dallas',
  'hunter',
  'pepper',
  'abcdef',
  '123qwe',
  'zaq12wsx',
  'zxcvbnm123',
  'andrew',
  'daniel',
  'princess',
  'Soccer',
]

/**
 * Check if a password is in the common passwords list
 */
export function isCommonPassword(password: string): boolean {
  const lowerPassword = password.toLowerCase()
  return COMMON_PASSWORDS.some(common => 
    lowerPassword === common.toLowerCase() ||
    lowerPassword.includes(common.toLowerCase())
  )
}

/**
 * Get a list of similar common passwords to help user understand why their password was rejected
 */
export function findSimilarCommonPasswords(password: string, limit: number = 3): string[] {
  const lowerPassword = password.toLowerCase()
  return COMMON_PASSWORDS
    .filter(common => 
      lowerPassword.includes(common.toLowerCase()) ||
      common.toLowerCase().includes(lowerPassword)
    )
    .slice(0, limit)
}
