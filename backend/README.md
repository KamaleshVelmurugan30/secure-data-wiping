# TrustWipe Backend

Production-grade Node.js + TypeScript backend for secure data wiping orchestration and certificate management.

## Features

- **Secure Wipe Orchestration**: Coordinate secure data sanitization across Windows agents
- **NIST SP 800-88 Compliance**: Clear, Purge, and Destroy sanitization levels
- **Certificate Management**: PDF and JSON certificates with PKCS#7 signatures
- **Blockchain Anchoring**: Optional EVM-based certificate hash anchoring
- **Partner Delivery**: Webhook, email, and API delivery with retry logic
- **Audit Trail**: Comprehensive logging for compliance and security

## Quick Start

### Development Setup

1. **Clone and Setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**:
   ```bash
   # Start PostgreSQL and Redis (via Docker)
   docker-compose up postgres redis -d
   
   # Run migrations
   npx prisma migrate dev
   
   # Generate Prisma client
   npx prisma generate
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## API Documentation

### Authentication

- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Create new user (admin only)

### Agents

- `POST /api/agents/enroll` - Register new agent
- `GET /api/agents/:id/jobs` - Poll for assigned jobs (agent endpoint)
- `GET /api/agents` - List agents (admin)

### Wipe Jobs

- `POST /api/wipes` - Create wipe job
- `GET /api/wipes/:id` - Get job details
- `PATCH /api/wipes/:id/status` - Update job status (agent)
- `PUT /api/wipes/:id/result` - Upload wipe results (agent)

### Certificates

- `POST /api/certificates/upload` - Upload and verify certificate
- `GET /api/certificates/:id` - Get certificate details
- `GET /api/certificates/:id/download/:type` - Download certificate files

### Blockchain

- `POST /api/blockchain/anchor` - Anchor certificate hash
- `GET /api/blockchain/record/:tx` - Get blockchain record status

## Architecture

### Core Components

- **Express.js API Server** with TypeScript
- **Prisma ORM** with PostgreSQL
- **BullMQ** with Redis for async jobs
- **JWT Authentication** with httpOnly cookies
- **PKCS#7 Signature Verification**
- **EVM Blockchain Integration**

### Data Model

Key entities:
- `User` - System users with role-based access
- `Agent` - Enrolled WPF agents
- `Asset` - IT assets to be sanitized
- `WipeJob` - Sanitization jobs with NIST compliance
- `Certificate` - Audit certificates with verification
- `BlockchainRecord` - Hash anchoring records

### Security Features

- **Helmet.js** security headers
- **CORS** protection
- **Rate limiting** per IP
- **CSRF** protection
- **JWT** with secure httpOnly cookies
- **Input validation** with Zod
- **Audit logging** for compliance

## NIST SP 800-88 Implementation

### Sanitization Categories

1. **Clear**: Logical techniques to sanitize data
   - File overwrite with verification
   - Suitable for normal data protection

2. **Purge**: Physical/logical techniques resistant to lab recovery
   - ATA Secure Erase (HDD)
   - NVMe Sanitize (SSD)
   - Cryptographic erase

3. **Destroy**: Complete media destruction
   - Software sanitization + physical destruction
   - Highest security level

### Media-Specific Recommendations

- **HDD**: Multi-pass overwrite or ATA Secure Erase
- **SSD/NVMe**: Controller-level sanitization (Sanitize command)
- **Flash/Removable**: Overwrite with wear-leveling warnings
- **Folder Scope**: File overwrite + freespace wiping

## Certificate Management

### Certificate Types

- **JSON Certificate**: Machine-readable audit data
- **PDF Certificate**: Human-readable compliance report
- **PKCS#7 Signature**: Tamper-proof digital signature

### Verification Process

1. Parse PKCS#7 signature structure
2. Verify digital signature against certificate data
3. Validate certificate chain against CA bundle
4. Check certificate validity period
5. Generate verification report

## Blockchain Integration

### Supported Networks

- Ethereum mainnet/testnets
- Polygon
- BSC (Binance Smart Chain)
- Any EVM-compatible network

### Smart Contract Interface

```solidity
function anchorCertificate(bytes32 _certHash) external returns (bool);
```

The backend submits certificate hashes to provide immutable proof of existence.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `BLOCKCHAIN_RPC_URL` | EVM RPC endpoint | Optional (mock mode) |
| `CONTRACT_ADDRESS` | Smart contract address | Optional |
| `PRIVATE_KEY` | Wallet private key | Optional |
| `CA_BUNDLE_PATH` | CA certificates for PKCS#7 | `./certs/ca-bundle.pem` |

## Health Checks

- `GET /health` - Basic health check
- `GET /ready` - Readiness check (includes DB connection)

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

## Monitoring

### Logging

- Structured JSON logging with Pino
- Request/response logging
- Error tracking with stack traces
- Audit trail for compliance

### Metrics

- BullMQ job statistics
- Database connection health
- API response times
- Certificate verification success rates

## Security Considerations

### Production Checklist

- [ ] Change default JWT secret
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Review audit log retention
- [ ] Validate CA certificate bundle
- [ ] Test disaster recovery procedures

### Agent Security

- mTLS certificate authentication
- Agent token rotation
- Secure job assignment validation
- Run log integrity verification (SHA-256)

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update API documentation
4. Follow semantic versioning
5. Ensure security review for sensitive changes

## License

Proprietary - TrustWipe Secure Data Sanitization System