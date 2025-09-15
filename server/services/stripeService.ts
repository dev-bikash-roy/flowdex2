import Stripe from 'stripe';

// Validate that API keys are provided
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY environment variable is not set');
}

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

// Define subscription plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 999, // $9.99 in cents
    interval: 'month',
    features: [
      'Up to 100 trades per month',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 2999, // $29.99 in cents
    interval: 'month',
    features: [
      'Unlimited trades',
      'Advanced analytics',
      'Priority support',
      'Backtesting features'
    ]
  }
];

/**
 * Create a Stripe customer
 * @param email Customer email
 * @param name Customer name
 * @returns Stripe customer object
 */
export async function createCustomer(email: string, name: string): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error(`Failed to create customer: ${error}`);
  }
}

/**
 * Create a subscription for a customer
 * @param customerId Stripe customer ID
 * @param planId Plan ID from subscriptionPlans
 * @returns Stripe subscription object
 */
export async function createSubscription(customerId: string, planId: string): Promise<Stripe.Subscription> {
  try {
    // Find the plan
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }
    
    // Create a price if it doesn't exist
    const price = await stripe.prices.create({
      unit_amount: plan.price,
      currency: 'usd',
      recurring: { interval: plan.interval },
      product_data: {
        name: plan.name,
      },
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
    
    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw new Error(`Failed to create subscription: ${error}`);
  }
}

/**
 * Cancel a subscription
 * @param subscriptionId Stripe subscription ID
 * @returns Cancellation confirmation
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    return false;
  }
}

/**
 * Get subscription details
 * @param subscriptionId Stripe subscription ID
 * @returns Stripe subscription object
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    return null;
  }
}

export default stripe;