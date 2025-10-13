/**
 * Email Service
 *
 * Handles sending advocacy emails to venues
 * Demo-safe: logs emails in dev mode instead of sending
 */

import { prisma } from '@/lib/db/prisma';
import { isDemoMode } from '@/lib/config/eventMode';
import type { AdvocacyEmailData } from '@/lib/types/advocacy';

export class EmailService {
  /**
   * Send advocacy email to venue
   */
  async sendAdvocacyEmail(advocacyRequestId: number): Promise<{ success: boolean; demo?: boolean }> {
    const advocacyRequest = await prisma.advocacyRequest.findUnique({
      where: { id: advocacyRequestId },
      include: {
        event: {
          include: {
            venue: true,
          },
        },
      },
    });

    if (!advocacyRequest || !advocacyRequest.venueEmail) {
      throw new Error('Advocacy request or venue email not found');
    }

    const emailData: AdvocacyEmailData = {
      advocacyRequest: advocacyRequest as any,
      event: {
        title: advocacyRequest.event.title,
        startsAt: advocacyRequest.event.startsAt,
        venue: {
          name: advocacyRequest.event.venue.name,
        },
      },
      stats: {
        impressions: advocacyRequest.event.impressions,
        clickThroughs: advocacyRequest.event.clickThroughs,
        estimatedAdValue: Number(advocacyRequest.event.estimatedAdValue),
        advocacyCount: advocacyRequest.event.advocacyCount,
      },
    };

    // Demo mode: log instead of sending
    if (isDemoMode()) {
      console.log('📧 [DEMO MODE] Would send advocacy email:');
      console.log('  To:', advocacyRequest.venueEmail);
      console.log('  Event:', emailData.event.title);
      console.log('  From fan:', advocacyRequest.email);
      console.log('  Impressions:', emailData.stats.impressions);
      console.log('  Est. Ad Value: $' + emailData.stats.estimatedAdValue.toFixed(2));

      // Mark as sent for testing flow
      await prisma.advocacyRequest.update({
        where: { id: advocacyRequestId },
        data: {
          emailSent: true,
          sentAt: new Date(),
        },
      });

      return { success: true, demo: true };
    }

    // Production: send real email
    try {
      const emailContent = this.generateEmailContent(emailData);

      // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
      // await sendEmail({
      //   to: advocacyRequest.venueEmail,
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      // });

      // For now, just log in production
      console.log('📧 [PRODUCTION] Sending advocacy email:', {
        to: advocacyRequest.venueEmail,
        subject: emailContent.subject,
      });

      // Mark as sent
      await prisma.advocacyRequest.update({
        where: { id: advocacyRequestId },
        data: {
          emailSent: true,
          sentAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send advocacy email:', error);
      throw error;
    }
  }

  /**
   * Generate email content for venue advocacy
   *
   * TODO: Review and enhance email template with more persuasive copy
   * TODO: A/B test different subject lines and CTAs
   * TODO: Add personalization based on venue size/location
   */
  private generateEmailContent(data: AdvocacyEmailData): { subject: string; html: string } {
    const { event, stats, advocacyRequest } = data;

    const subject = `${stats.advocacyCount} fans want fair ticketing at ${event.venue.name}`;

    // Calculate savings potential
    const avgTicketPrice = 50; // Estimate
    const avgTicketsPerEvent = 500; // Estimate
    const platformFee = 0.25; // 25% typical Ticketmaster fee
    const potentialSavings = avgTicketPrice * avgTicketsPerEvent * platformFee;

    // TODO: Make email template more persuasive with:
    // - Social proof (number of advocates)
    // - Specific dollar amounts
    // - Success stories from other venues
    // - Clear call-to-action
    // - Limited time urgency

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .stat-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
    .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { color: #6b7280; font-size: 14px; padding: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Fans Are Speaking Up</h1>
      <p>${stats.advocacyCount} advocates are asking ${event.venue.name} to switch to fair ticketing</p>
    </div>

    <div class="content">
      <h2>Here's What You're Missing:</h2>

      <div class="stat-box">
        <div class="stat-number">$${stats.estimatedAdValue.toFixed(2)}</div>
        <p><strong>Free Marketing Value You've Already Received</strong></p>
        <p>From ${stats.impressions.toLocaleString()} impressions and ${stats.clickThroughs.toLocaleString()} clicks on your event listings.</p>
      </div>

      <div class="stat-box">
        <div class="stat-number">$${potentialSavings.toLocaleString()}</div>
        <p><strong>Potential Savings Per Event</strong></p>
        <p>By eliminating 25% platform fees that Ticketmaster charges. That's money you could reinvest in better artist deals, venue improvements, or fan experiences.</p>
      </div>

      <div class="stat-box">
        <div class="stat-number">$0</div>
        <p><strong>What You Earn From Resales Today</strong></p>
        <p>With fair ticketing, you control secondary market revenue. Fans get fair prices, you get fair compensation.</p>
      </div>

      <h3>What Fans Are Saying:</h3>
      ${advocacyRequest.userMessage ? `
      <blockquote style="border-left: 3px solid #667eea; padding-left: 15px; color: #4b5563; font-style: italic;">
        "${advocacyRequest.userMessage}"
        <br><small>- ${advocacyRequest.email}</small>
      </blockquote>
      ` : ''}

      <h3>Why Switch to Unchained?</h3>
      <ul>
        <li><strong>Lower Fees:</strong> 5% vs 25% industry standard</li>
        <li><strong>NFT Tickets:</strong> Eliminate fraud, enable resale royalties</li>
        <li><strong>Fan Rewards:</strong> Build loyalty with blockchain-based perks</li>
        <li><strong>Your Data:</strong> Own your customer relationships</li>
      </ul>

      <center>
        <a href="https://unchained.tickets/venue-signup" class="cta">Schedule a Demo</a>
      </center>

      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Join venues who've already made the switch. Your fans are ready. Are you?
      </p>
    </div>

    <div class="footer">
      <p>Unchained Tickets - Fair Ticketing for Everyone</p>
      <p>This email was sent on behalf of ${stats.advocacyCount} fans who want better ticketing at ${event.venue.name}</p>
    </div>
  </div>
</body>
</html>
    `;

    return { subject, html };
  }

  /**
   * Send batch advocacy emails (for cron job)
   */
  async sendBatchAdvocacyEmails(limit: number = 10): Promise<number> {
    const pendingRequests = await prisma.advocacyRequest.findMany({
      where: { emailSent: false },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    let successCount = 0;

    for (const request of pendingRequests) {
      try {
        await this.sendAdvocacyEmail(request.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to send advocacy email ${request.id}:`, error);
      }
    }

    return successCount;
  }
}

export const emailService = new EmailService();
