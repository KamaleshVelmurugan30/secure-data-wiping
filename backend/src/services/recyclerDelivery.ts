import nodemailer from 'nodemailer';

export class RecyclerDelivery {
  private mailer = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async deliver(delivery: any) {
    switch (delivery.method) {
      case 'WEBHOOK':
        return this.deliverWebhook(delivery);
      case 'EMAIL':
        return this.deliverEmail(delivery);
      case 'API':
        return this.deliverAPI(delivery);
    }
  }

  private async deliverWebhook(delivery: any) {
    const payload = {
      jobId: delivery.jobId,
      status: 'completed',
      certificate: delivery.job.certificate,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(delivery.partner.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Webhook failed: ${response.status}`);
  }

  private async deliverEmail(delivery: any) {
    await this.mailer.sendMail({
      to: delivery.partner.contactEmail,
      subject: `Wipe Certificate - Job ${delivery.jobId}`,
      html: `<p>Wipe job completed. Certificate attached.</p>`,
      attachments: [
        { filename: 'certificate.json', content: JSON.stringify(delivery.job.certificate.jsonBlob) },
      ],
    });
  }

  private async deliverAPI(delivery: any) {
    const response = await fetch(`${delivery.partner.apiBase}/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${delivery.partner.apiKey}`,
      },
      body: JSON.stringify(delivery.job.certificate),
    });

    if (!response.ok) throw new Error(`API delivery failed: ${response.status}`);
  }
}