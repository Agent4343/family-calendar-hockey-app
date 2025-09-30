import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, from, body, accountSid, authToken } = await request.json();

    // Validate input
    if (!to || !from || !body || !accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Missing required fields: to, from, body, accountSid, authToken' },
        { status: 400 }
      );
    }

    // Twilio API integration
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', from);
    formData.append('Body', body);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
      },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'SMS sent via Twilio',
        messageId: data.sid,
        to,
        from,
        sentAt: data.date_created
      });
    } else {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          error: 'Twilio API error', 
          details: errorData.message || 'Unknown error',
          code: errorData.code
        },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('Twilio SMS error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get Twilio setup instructions
export async function GET() {
  return NextResponse.json({
    instructions: {
      title: 'Twilio SMS Setup',
      description: 'Professional SMS service with delivery confirmation',
      steps: [
        '1. Create a Twilio account at https://twilio.com',
        '2. Verify your phone number',
        '3. Get your Account SID and Auth Token from the console',
        '4. Purchase a Twilio phone number (+$1/month)',
        '5. Enter credentials in the SMS settings',
        '6. Test with your family members'
      ],
      pricing: {
        setup: 'Free account + phone number ($1/month)',
        messaging: '$0.0075 per SMS sent',
        example: '100 messages/month = ~$0.75 + $1 phone = $1.75/month'
      },
      features: [
        '✅ Delivery confirmation',
        '✅ Works with all carriers',
        '✅ Fast delivery (usually < 10 seconds)',
        '✅ No carrier knowledge required',
        '✅ Professional service',
        '✅ Global SMS support'
      ],
      environment: {
        'TWILIO_ACCOUNT_SID': 'Your Account SID',
        'TWILIO_AUTH_TOKEN': 'Your Auth Token',
        'TWILIO_PHONE_NUMBER': 'Your Twilio number (+1234567890)'
      }
    }
  });
}
