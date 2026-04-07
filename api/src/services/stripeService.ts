import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> => {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
};

export const confirmPaymentIntent = async (paymentIntentId: string): Promise<Stripe.PaymentIntent> => {
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

export const createRefund = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  const params: Stripe.RefundCreateParams = { payment_intent: paymentIntentId };
  if (amount) params.amount = Math.round(amount * 100);
  return stripe.refunds.create(params);
};

export const constructWebhookEvent = (
  payload: Buffer,
  signature: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );
};

export default stripe;