import axios from 'axios';

const AFFIRM_API_URL = process.env.AFFIRM_API_URL || 'https://sandbox.affirm.com/api/v2';
const AFFIRM_PUBLIC_KEY = process.env.AFFIRM_PUBLIC_KEY || '';
const AFFIRM_PRIVATE_KEY = process.env.AFFIRM_PRIVATE_KEY || '';

const getAuthHeader = () => {
  return 'Basic ' + Buffer.from(`${AFFIRM_PUBLIC_KEY}:${AFFIRM_PRIVATE_KEY}`).toString('base64');
};

/**
 * Authorize an Affirm charge using a checkout token
 */
export const authorizeAffirmCharge = async (checkoutToken: string, orderId: string) => {
  try {
    const response = await axios.post(
      `${AFFIRM_API_URL}/charges`,
      {
        checkout_token: checkoutToken,
        order_id: orderId,
      },
      {
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Affirm authorization failed');
  }
};

/**
 * Capture an authorized Affirm charge
 */
export const captureAffirmCharge = async (chargeId: string, orderId: string) => {
  try {
    const response = await axios.post(
      `${AFFIRM_API_URL}/charges/${chargeId}/capture`,
      { order_id: orderId },
      {
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Affirm capture failed');
  }
};

/**
 * Read details of an Affirm charge
 */
export const readAffirmCharge = async (chargeId: string) => {
  try {
    const response = await axios.get(`${AFFIRM_API_URL}/charges/${chargeId}`, {
      headers: {
        Authorization: getAuthHeader(),
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Affirm read charge failed');
  }
};

/**
 * Refund an Affirm charge
 */
export const refundAffirmCharge = async (chargeId: string, amount?: number) => {
  try {
    const payload: any = {};
    if (amount) {
      payload.amount = Math.round(amount * 100); // Affirm expects cents
    }
    
    const response = await axios.post(
      `${AFFIRM_API_URL}/charges/${chargeId}/refund`,
      payload,
      {
        headers: {
          Authorization: getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Affirm refund failed');
  }
};
