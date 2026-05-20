import emailjs from '@emailjs/browser';

// Reemplazar estas constantes con los valores reales obtenidos desde la consola de EmailJS
// También pueden configurarse en un archivo .env (.env.local) como VITE_EMAILJS_SERVICE_ID
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

export interface ReservationEmailParams {
  to_name: string;
  to_email: string;
  car_brand: string;
  car_model: string;
  start_date: string;
  end_date: string;
  total_cost: string;
  qr_code_url?: string;
}

export const sendReservationConfirmation = async (params: ReservationEmailParams) => {
  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_name: params.to_name,
        to_email: params.to_email,
        car_brand: params.car_brand,
        car_model: params.car_model,
        start_date: params.start_date,
        end_date: params.end_date,
        total_cost: params.total_cost,
        qr_code_url: params.qr_code_url,
      },
      PUBLIC_KEY
    );
    console.log('SUCCESS sending email!', response.status, response.text);
    return response;
  } catch (error) {
    console.error('FAILED sending email...', error);
    throw error;
  }
};
