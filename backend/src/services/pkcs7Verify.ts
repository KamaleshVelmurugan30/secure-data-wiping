import * as forge from 'node-forge';
import { promises as fs } from 'fs';

export interface VerificationResult {
  valid: boolean;
  signerCertificate?: forge.pki.Certificate;
  caDetails?: {
    issuer: string;
    subject: string;
    validFrom: Date;
    validTo: Date;
    serialNumber: string;
    fingerprint: string;
  };
  errors?: string[];
}

export class PKCS7Verify {
  private caCertificates: forge.pki.Certificate[] = [];

  constructor() {
    this.loadCACertificates();
  }

  private async loadCACertificates() {
    try {
      const caBundlePath = process.env.CA_BUNDLE_PATH || './certs/ca-bundle.pem';
      const caBundleContent = await fs.readFile(caBundlePath, 'utf8');
      
      // Parse PEM bundle containing multiple certificates
      const certs = caBundleContent.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g);
      
      if (certs) {
        for (const certPem of certs) {
          try {
            const cert = forge.pki.certificateFromPem(certPem);
            this.caCertificates.push(cert);
          } catch (error) {
            console.warn('Failed to parse CA certificate:', error);
          }
        }
      }
      
      console.log(`Loaded ${this.caCertificates.length} CA certificates`);
    } catch (error) {
      console.warn('Failed to load CA bundle, proceeding without certificate validation:', error);
    }
  }

  async verify(dataFilePath: string, signatureFilePath: string): Promise<VerificationResult> {
    try {
      // Read the original data file
      const dataContent = await fs.readFile(dataFilePath, 'utf8');
      
      // Read the PKCS#7 signature file
      const signatureContent = await fs.readFile(signatureFilePath, 'utf8');
      
      // Parse the PKCS#7 signature
      let p7: forge.pkcs7.PkcsSignedData;
      
      if (signatureContent.includes('-----BEGIN PKCS7-----')) {
        // PEM format
        p7 = forge.pkcs7.messageFromPem(signatureContent);
      } else {
        // Binary format (base64 encoded)
        const der = forge.util.decode64(signatureContent);
        const asn1 = forge.asn1.fromDer(der);
        p7 = forge.pkcs7.messageFromAsn1(asn1);
      }

      const errors: string[] = [];
      
      // Get the signer certificate
      const signerCert = p7.certificates?.[0];
      if (!signerCert) {
        errors.push('No signer certificate found in PKCS#7 signature');
        return { valid: false, errors };
      }

      // Verify the signature against the data
      const isSignatureValid = p7.verify();
      if (!isSignatureValid) {
        errors.push('PKCS#7 signature verification failed');
      }

      // Verify certificate chain if CA certificates are available
      let isCertValid = true;
      if (this.caCertificates.length > 0) {
        const caStore = forge.pki.createCaStore(this.caCertificates);
        
        try {
          forge.pki.verifyCertificateChain(caStore, [signerCert]);
        } catch (error) {
          errors.push(`Certificate chain verification failed: ${error}`);
          isCertValid = false;
        }
      } else {
        console.warn('No CA certificates loaded, skipping chain validation');
      }

      // Check certificate validity period
      const now = new Date();
      if (now < signerCert.validity.notBefore) {
        errors.push('Certificate is not yet valid');
        isCertValid = false;
      }
      if (now > signerCert.validity.notAfter) {
        errors.push('Certificate has expired');
        isCertValid = false;
      }

      // Extract certificate details
      const caDetails = {
        issuer: signerCert.issuer.getField('CN')?.value || 'Unknown',
        subject: signerCert.subject.getField('CN')?.value || 'Unknown',
        validFrom: signerCert.validity.notBefore,
        validTo: signerCert.validity.notAfter,
        serialNumber: signerCert.serialNumber,
        fingerprint: forge.md.sha256.create()
          .update(forge.asn1.toDer(forge.pki.certificateToAsn1(signerCert)).getBytes())
          .digest()
          .toHex(),
      };

      const isValid = isSignatureValid && isCertValid && errors.length === 0;

      return {
        valid: isValid,
        signerCertificate: signerCert,
        caDetails,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`PKCS#7 verification error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  // Utility method to create a detached PKCS#7 signature (for reference)
  static createSignature(
    dataContent: string,
    privateKeyPem: string,
    certificatePem: string
  ): string {
    try {
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      const certificate = forge.pki.certificateFromPem(certificatePem);
      
      const p7 = forge.pkcs7.createSignedData();
      p7.content = forge.util.createBuffer(dataContent, 'utf8');
      p7.addCertificate(certificate);
      p7.addSigner({
        key: privateKey,
        certificate: certificate,
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
          {
            type: forge.pki.oids.contentTypes,
            value: forge.pki.oids.data,
          },
          {
            type: forge.pki.oids.messageDigest,
            // value will be auto-populated at signing time
          },
          {
            type: forge.pki.oids.signingTime,
            value: new Date(),
          },
        ],
      });
      
      p7.sign({ detached: true });
      
      return forge.pkcs7.messageToPem(p7);
    } catch (error) {
      throw new Error(`Failed to create PKCS#7 signature: ${error}`);
    }
  }
}