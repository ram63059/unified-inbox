import twilio from 'twilio';

// Initialize Twilio client with credentials from environment
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

export const twilioClient = twilio(accountSid, authToken);

//helper function to send SMS

export async function SendSMS(to:string, body:string,mediaUrls?:string[]){

    try{
        const message= await twilioClient.messages.create({
                to,
                from: process.env.TWILIO_PHONE_NUMBER!,
                body,
                mediaUrl: mediaUrls,
        });

    return {success:true ,sid:message.sid};

    }catch (error : unknown){
        const err = error as Error;
        console.error('Twilio sms error',err);
        return {success:false , error:err.message};
    }
}

// Helper function to send WhatsApp message
export async function sendWhatsApp(to: string, body: string, mediaUrls?: string[]) {
  try {
    // WhatsApp numbers need "whatsapp:" prefix
    const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    const message = await twilioClient.messages.create({
      to: whatsappTo,
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      body,
      mediaUrl: mediaUrls,
    });
    
    return { success: true, sid: message.sid };
  } catch (error: unknown) {
    const err = error as Error;

    console.error('Twilio WhatsApp Error:', err);
    return { success: false, error: err.message };
  }
}