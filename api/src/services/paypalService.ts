import axios from 'axios';

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const getAccessToken = async (): Promise<string> => {
  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID as string,
        password: process.env.PAYPAL_CLIENT_SECRET as string,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return response.data.access_token;
};

export const createPayPalOrder = async (
  amount: number,
  currency: string = 'USD',
  description: string = 'LANForge Order'
): Promise<{ id: string; approveUrl: string }> => {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description,
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/order-status?payment=success`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?payment=cancelled`,
        brand_name: 'LANForge',
        user_action: 'PAY_NOW',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const order = response.data;
  const approveUrl = order.links.find((l: any) => l.rel === 'approve')?.href || '';

  return { id: order.id, approveUrl };
};

export const capturePayPalOrder = async (orderId: string): Promise<any> => {
  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

export const refundPayPalCapture = async (captureId: string, amount?: number): Promise<any> => {
  const accessToken = await getAccessToken();

  const body: any = {};
  if (amount) {
    body.amount = { value: amount.toFixed(2), currency_code: 'USD' };
  }

  const response = await axios.post(
    `${PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`,
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};