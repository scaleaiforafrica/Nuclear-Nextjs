# Security Considerations

## Overview

The NuclearFlow blockchain traceability system handles sensitive nuclear material tracking data. This document outlines security features, considerations, best practices, and compliance measures to ensure data integrity, confidentiality, and regulatory compliance.

## Table of Contents

1. [Data Integrity](#data-integrity)
2. [Authentication and Authorization](#authentication-and-authorization)
3. [Input Validation](#input-validation)
4. [Rate Limiting](#rate-limiting)
5. [Audit Logging](#audit-logging)
6. [Data Immutability](#data-immutability)
7. [Compliance](#compliance)
8. [Security Best Practices](#security-best-practices)
9. [Vulnerability Reporting](#vulnerability-reporting)

## Data Integrity

### Cryptographic Hashing

All blockchain events use **SHA-256** cryptographic hashing to ensure data integrity.

#### Hash Generation

```typescript
// Event data is hashed using SHA-256
const eventData = {
  shipmentId: event.shipmentId,
  eventType: event.eventType,
  actor: event.actor,
  location: event.location,
  metadata: event.metadata,
  timestamp: event.timestamp.toISOString()
};

const jsonString = JSON.stringify(eventData);
const dataHash = crypto
  .createHash('sha256')
  .update(jsonString)
  .digest('hex');
```

**Security Properties**:
- ✅ **Collision Resistance**: Computationally infeasible to find two inputs with same hash
- ✅ **Pre-image Resistance**: Cannot derive original data from hash
- ✅ **Avalanche Effect**: Small change in input produces completely different hash
- ✅ **Deterministic**: Same input always produces same hash

#### Hash Verification

```typescript
// Verify event data matches stored hash
function verifyEventHash(event: BlockchainEvent): boolean {
  const calculatedHash = generateDataHash(event);
  return calculatedHash === event.dataHash;
}

// Verification detects:
// - Data tampering
// - Data corruption
// - Unauthorized modifications
```

### Chain Linking

Events are cryptographically linked in a blockchain-style chain.

```
┌─────────────────────────────────────────────┐
│ Event 1 (Genesis)                           │
│ dataHash: abc123...                         │
│ previousHash: genesis_[shipmentId]          │
└─────────────────┬───────────────────────────┘
                  │ Chain Link
                  │ (previousHash → dataHash)
┌─────────────────▼───────────────────────────┐
│ Event 2                                     │
│ dataHash: def456...                         │
│ previousHash: abc123... ✓                   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
```

**Security Benefits**:
- ✅ Tamper detection: Broken links indicate modification
- ✅ Event ordering: Chronological integrity enforced
- ✅ Complete history: Cannot delete events without breaking chain
- ✅ Audit trail: Full provenance of all changes

### Chain Verification

```typescript
// Comprehensive chain verification
async function verifyChain(shipmentId: string): ChainVerificationResult {
  const events = await getShipmentEvents(shipmentId);
  
  // Check 1: Verify genesis hash
  const expectedGenesisHash = generateGenesisHash(shipmentId);
  if (events[0].previousHash !== expectedGenesisHash) {
    // Genesis link broken - possible tampering
  }
  
  // Check 2: Verify chain links
  for (let i = 1; i < events.length; i++) {
    if (events[i].previousHash !== events[i - 1].dataHash) {
      // Chain link broken - possible tampering
    }
  }
  
  // Check 3: Verify data hashes
  for (const event of events) {
    if (!verifyEventHash(event)) {
      // Data hash invalid - data modified
    }
  }
  
  return {
    isValid: noIssuesFound,
    brokenLinks: [...],
    invalidHashes: [...]
  };
}
```

## Authentication and Authorization

### Authentication

All API endpoints require valid authentication via **Supabase Auth**.

#### JWT Token-Based Authentication

```typescript
// Authentication flow
1. User signs in with email/password
2. Supabase returns JWT access token
3. Client includes token in Authorization header
4. Server validates token before processing request

// Example request
fetch('/api/traceability/events', {
  headers: {
    'Authorization': 'Bearer <jwt-token>',
    'Content-Type': 'application/json'
  }
});
```

**Security Features**:
- ✅ Token expiration (configurable TTL)
- ✅ Refresh token rotation
- ✅ Secure token storage (httpOnly cookies)
- ✅ Token revocation support

### Authorization

Role-based access control (RBAC) determines what users can do.

#### Permission Model

| Role | Record Events | View Events | Verify Chain | Export Data | View Stats |
|------|--------------|-------------|--------------|-------------|------------|
| **Viewer** | ❌ | ✅ (own org) | ✅ | ❌ | ✅ (own org) |
| **Operator** | ✅ | ✅ (own org) | ✅ | ✅ (own org) | ✅ (own org) |
| **Inspector** | ✅ | ✅ (multi-org) | ✅ | ✅ (multi-org) | ✅ (multi-org) |
| **Admin** | ✅ | ✅ (all) | ✅ | ✅ (all) | ✅ (all) |

#### Authorization Checks

```typescript
// Server-side authorization
async function authorizeRequest(user: User, action: string, resource: string) {
  // Check if user has permission for action on resource
  const hasPermission = await checkPermission(user.role, action, resource);
  
  if (!hasPermission) {
    throw new UnauthorizedError('Insufficient permissions');
  }
}

// Example: Check if user can record event
await authorizeRequest(user, 'record_event', shipmentId);
```

### API Key Authentication (Future)

For system-to-system integrations:

```typescript
// API key authentication (planned)
fetch('/api/traceability/events', {
  headers: {
    'X-API-Key': '<api-key>',
    'Content-Type': 'application/json'
  }
});
```

**Planned Features**:
- API key generation per integration
- Key rotation policies
- Usage tracking per key
- Rate limiting per key
- IP whitelisting

## Input Validation

### Schema Validation

All inputs are validated using **Zod** schemas before processing.

```typescript
// Event input validation
const createEventSchema = z.object({
  shipmentId: z.string().uuid('Invalid shipment ID'),
  eventType: z.enum([
    'shipment_created',
    'dispatch',
    'pickup',
    // ... all 21 event types
  ]),
  actor: z.object({
    id: z.string(),
    type: z.enum(['user', 'system', 'iot_sensor', 'api']),
    name: z.string(),
    role: z.string().optional(),
    organization: z.string().optional(),
    deviceId: z.string().optional()
  }),
  location: z.object({
    name: z.string(),
    type: z.enum(['facility', 'checkpoint', 'vehicle', 'port', 'customs', 'destination', 'unknown']),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    countryCode: z.string().length(2).optional()
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
  signature: z.string().optional()
});

// Validate before processing
const validation = createEventSchema.safeParse(input);
if (!validation.success) {
  return { error: 'Validation failed', details: validation.error.issues };
}
```

### SQL Injection Prevention

**Parameterized Queries**: All database operations use parameterized queries via Supabase client.

```typescript
// Safe: Parameterized query
const { data } = await supabase
  .from('blockchain_events')
  .select('*')
  .eq('shipment_id', shipmentId); // ✅ Parameter binding

// Unsafe: String concatenation (NEVER DO THIS)
const query = `SELECT * FROM blockchain_events WHERE shipment_id = '${shipmentId}'`; // ❌
```

### XSS Prevention

- ✅ All user input is sanitized before display
- ✅ React automatically escapes JSX output
- ✅ Content-Security-Policy headers configured
- ✅ No `dangerouslySetInnerHTML` usage

### CSRF Protection

- ✅ SameSite cookie attribute set
- ✅ CSRF tokens for state-changing operations
- ✅ Origin validation on requests

## Rate Limiting

### Current Implementation

No rate limiting currently enforced (development phase).

### Planned Implementation

| Endpoint Type | Rate Limit | Window | Burst Limit |
|--------------|------------|--------|-------------|
| **GET** (read) | 1000 req/hr | 1 hour | 100 req/min |
| **POST** (write) | 100 req/hr | 1 hour | 10 req/min |
| **Export** | 20 req/hr | 1 hour | 5 req/min |
| **Verify** | 200 req/hr | 1 hour | 20 req/min |

```typescript
// Rate limiting middleware (planned)
const rateLimiter = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};

// Apply to routes
app.use('/api/traceability', rateLimiter);
```

### DDoS Protection

- ✅ Cloudflare/AWS WAF protection
- ✅ Connection rate limiting
- ✅ Request size limits (10MB max)
- ✅ Slowloris attack prevention

## Audit Logging

### Event Logging

Every API request is logged with:

```typescript
interface AuditLog {
  timestamp: Date;           // When request occurred
  userId: string;            // Who made the request
  action: string;            // What action (e.g., 'record_event')
  resource: string;          // What resource (shipmentId)
  ipAddress: string;         // Source IP
  userAgent: string;         // Client user agent
  success: boolean;          // Operation success
  errorMessage?: string;     // Error if failed
  metadata: Record<string, any>; // Additional context
}
```

### Database Audit Trail

```sql
-- All blockchain_events have audit fields
CREATE TABLE blockchain_events (
  id UUID PRIMARY KEY,
  -- ... event data ...
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Separate audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN,
  error_message TEXT,
  metadata JSONB
);

-- Index for efficient querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
```

### Log Retention

- **Audit logs**: Retained for 7 years (regulatory compliance)
- **Blockchain events**: Retained permanently (immutable)
- **System logs**: Retained for 90 days
- **Error logs**: Retained for 1 year

## Data Immutability

### Database-Level Immutability

```sql
-- No UPDATE or DELETE operations allowed on blockchain_events
-- Enforced at application level and database policies

-- Row Level Security (RLS) policy
CREATE POLICY "blockchain_events_immutable" ON blockchain_events
  FOR UPDATE USING (false);

CREATE POLICY "blockchain_events_no_delete" ON blockchain_events
  FOR DELETE USING (false);

-- Only INSERT allowed
CREATE POLICY "blockchain_events_insert" ON blockchain_events
  FOR INSERT WITH CHECK (true);
```

### Application-Level Enforcement

```typescript
// No UPDATE or DELETE methods exposed
class HyperledgerService {
  // ✅ Allowed: Insert new event
  async recordEvent(input: CreateBlockchainEventInput): Promise<RecordedEvent> {
    return await supabase.from('blockchain_events').insert(data);
  }

  // ✅ Allowed: Read events
  async getShipmentEvents(shipmentId: string): Promise<BlockchainEvent[]> {
    return await supabase.from('blockchain_events').select('*');
  }

  // ❌ Not implemented: Update event
  // async updateEvent() { } // Does not exist

  // ❌ Not implemented: Delete event
  // async deleteEvent() { } // Does not exist
}
```

### Tamper Detection

```typescript
// Chain verification detects any tampering
const result = await verifyChain(shipmentId);

if (!result.isValid) {
  // Alert: Blockchain integrity compromised
  await notifySecurityTeam({
    severity: 'CRITICAL',
    message: 'Blockchain chain integrity violation detected',
    shipmentId,
    brokenLinks: result.brokenLinks,
    invalidHashes: result.invalidHashes
  });
}
```

## Compliance

### WCAG Accessibility Compliance

All UI components follow WCAG 2.1 Level AA standards:

- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Sufficient color contrast (4.5:1 minimum)
- ✅ ARIA labels and descriptions
- ✅ Focus indicators
- ✅ Semantic HTML

### Privacy and Data Protection

#### GDPR Compliance

- ✅ **Right to Access**: Users can export their data
- ✅ **Data Minimization**: Only necessary data collected
- ✅ **Purpose Limitation**: Data used only for stated purpose
- ⚠️ **Right to Erasure**: Limited (blockchain immutability)
- ✅ **Data Portability**: Export in JSON/CSV formats
- ✅ **Privacy by Design**: Security built-in from start

**Note on Right to Erasure**: Due to blockchain immutability, complete deletion is not possible. Personal identifiers can be pseudonymized.

#### Data Encryption

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| **Database** | ✅ AES-256 | ✅ TLS 1.3 |
| **API Communication** | N/A | ✅ HTTPS only |
| **Backups** | ✅ Encrypted | ✅ Encrypted |
| **Exports** | ❌ Plain text | ✅ HTTPS |

### Regulatory Compliance

#### IAEA Requirements

- ✅ Complete audit trail
- ✅ Tamper-evident records
- ✅ Chain of custody tracking
- ✅ Real-time monitoring capability
- ✅ Export for regulatory reporting

#### NRC Requirements (10 CFR)

- ✅ Material tracking (10 CFR 20)
- ✅ Transport documentation (10 CFR 71)
- ✅ Security and safeguards (10 CFR 73)
- ✅ Record retention (minimum 7 years)

## Security Best Practices

### For Developers

1. **Never commit secrets**: Use environment variables
2. **Validate all inputs**: Use Zod schemas
3. **Use parameterized queries**: Prevent SQL injection
4. **Implement least privilege**: Minimal permissions
5. **Log security events**: Audit trail for incidents
6. **Keep dependencies updated**: Regular security patches
7. **Review code changes**: Security-focused code reviews
8. **Test security**: Regular penetration testing

### For Integrators

1. **Secure API credentials**: Never hardcode keys
2. **Use HTTPS only**: No HTTP connections
3. **Validate responses**: Check data integrity
4. **Implement retry logic**: Handle transient failures
5. **Log errors securely**: No sensitive data in logs
6. **Rotate credentials**: Regular key rotation
7. **Monitor usage**: Detect anomalous patterns
8. **Test integrations**: Thorough security testing

### For Operators

1. **Monitor audit logs**: Regular review
2. **Verify chain integrity**: Scheduled verification
3. **Review access logs**: Detect unauthorized access
4. **Update promptly**: Apply security patches quickly
5. **Backup regularly**: Encrypted backups
6. **Test disaster recovery**: Regular DR drills
7. **Train users**: Security awareness training
8. **Incident response plan**: Prepared for breaches

## Security Monitoring

### Key Metrics

```typescript
// Security monitoring dashboard
interface SecurityMetrics {
  // Authentication
  failedLoginAttempts: number;
  suspiciousActivityFlags: number;
  
  // Integrity
  chainVerificationFailures: number;
  invalidHashDetections: number;
  
  // Performance
  apiErrorRate: number;
  averageResponseTime: number;
  
  // Access
  unauthorizedAccessAttempts: number;
  unusualAccessPatterns: number;
}
```

### Alerts

| Alert Type | Severity | Threshold | Action |
|------------|----------|-----------|--------|
| **Chain integrity failure** | CRITICAL | 1 occurrence | Immediate investigation |
| **Failed login attempts** | HIGH | 5 in 10 min | Lock account, notify user |
| **Unauthorized access** | HIGH | 1 occurrence | Block IP, notify admin |
| **High error rate** | MEDIUM | >5% errors | Investigate, scale if needed |
| **Unusual access pattern** | MEDIUM | Anomaly detected | Review logs, notify security |

### Incident Response

```
1. Detection
   ↓
2. Containment
   - Isolate affected systems
   - Block malicious IPs
   - Revoke compromised credentials
   ↓
3. Investigation
   - Analyze audit logs
   - Identify root cause
   - Assess impact
   ↓
4. Remediation
   - Patch vulnerabilities
   - Restore from backup if needed
   - Update security policies
   ↓
5. Post-Incident Review
   - Document lessons learned
   - Update procedures
   - Train team
```

## Vulnerability Reporting

### Responsible Disclosure

If you discover a security vulnerability:

1. **Do not** publicly disclose the vulnerability
2. **Do not** exploit the vulnerability
3. **Do** report to: security@nuclearflow.com
4. **Do** provide details:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

### Response Timeline

- **24 hours**: Acknowledge receipt
- **72 hours**: Initial assessment
- **7 days**: Patch development (critical issues)
- **30 days**: Patch deployment
- **90 days**: Public disclosure (coordinated)

### Bug Bounty Program

Coming soon: Rewards for security researchers who responsibly disclose vulnerabilities.

## Security Roadmap

### Q1 2024
- ✅ JWT authentication
- ✅ SHA-256 hashing
- ✅ Chain verification
- ✅ Input validation

### Q2 2024
- 🚧 Rate limiting implementation
- 🚧 API key authentication
- 🚧 Digital signatures on events
- 🚧 Enhanced audit logging

### Q3 2024
- 📋 X.509 certificate authentication
- 📋 Multi-factor authentication (MFA)
- 📋 Hardware security module (HSM) integration
- 📋 Advanced threat detection

### Q4 2024
- 📋 Penetration testing
- 📋 SOC 2 Type II certification
- 📋 Bug bounty program launch
- 📋 Security awareness training

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Hyperledger Security](https://wiki.hyperledger.org/display/SEC/Security)

## Contact

**Security Team**: security@nuclearflow.com  
**Emergency Hotline**: +1-XXX-XXX-XXXX (24/7)

---

**Last Updated**: January 2024  
**Next Review**: April 2024
