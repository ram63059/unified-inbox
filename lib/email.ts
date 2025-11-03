import { Resend  } from "resend";

// Initialize Resend client

const resend =new Resend(process.env.RESEND_API_KEY!);


//helper function to send email

export async function sendEmail({
    to,
    subject,
    body,
}:{
    to:string;
    subject:string;
    body:string;
}){
    try {

        const {data ,error}=await resend.emails.send({
            from:process.env.RESEND_FROM_EMAIL!,
            to,
            subject,
            html:body,
        })

        if(error){
            console.error('Resend error',error);
            return {success:false,error:error.message}
        }


        return {success:true,id:data?.id}
        
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Email error',err);

        return {success:false,error:err.message};
        
    }
}

