/**
 * Stripe Webhook Handlers
 */

import { Router, Request, Response } from "express";
import Stripe from "stripe";

const router = Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

/**
 * Stripe Webhook Handler
 */
router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.log('⚠️ Stripe webhook secret not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed:`, (err as Error).message);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  console.log(`✅ Received webhook: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
      
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
      
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
      
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
      
    default:
      console.log(`🔍 Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Checkout session completed:', session.id);
  
  try {
    const { metadata } = session;
    const userId = metadata?.userId || 'anonymous';
    const planId = metadata?.planId;
    
    // Here you would typically:
    // 1. Update user's subscription status in your database
    // 2. Send confirmation email
    // 3. Grant premium access
    
    console.log(`✅ User ${userId} successfully subscribed to plan: ${planId}`);
    
    // For now, log the successful purchase
    // In a real app, you'd save this to your database
    const purchaseRecord = {
      userId,
      sessionId: session.id,
      planId,
      customerId: session.customer,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    console.log('📝 Purchase record:', purchaseRecord);
    
  } catch (error) {
    console.error('❌ Error handling checkout session:', error);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🎯 Subscription created:', subscription.id);
  
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    
    // Update user's subscription status
    console.log(`✅ Customer ${customerId} subscription status: ${status}`);
    
    // Here you would update your database with the new subscription
    
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);
  
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    
    console.log(`📝 Customer ${customerId} subscription updated to: ${status}`);
    
    // Handle subscription status changes
    if (status === 'canceled' || status === 'unpaid') {
      console.log('⚠️ Subscription requires attention:', status);
      // Revoke premium access if needed
    }
    
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  try {
    const customerId = subscription.customer as string;
    
    console.log(`🚫 Customer ${customerId} subscription canceled`);
    
    // Revoke premium access
    // Update database to reflect canceled subscription
    
  } catch (error) {
    console.error('❌ Error handling subscription deletion:', error);
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Invoice payment succeeded:', invoice.id);
  
  try {
    const customerId = invoice.customer as string;
    const subscriptionId = (invoice as any).subscription ? String((invoice as any).subscription) : null;
    
    console.log(`✅ Payment successful for customer ${customerId}, subscription ${subscriptionId}`);
    
    // Ensure premium access is active
    // Log successful payment
    
  } catch (error) {
    console.error('❌ Error handling invoice payment success:', error);
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('💥 Invoice payment failed:', invoice.id);
  
  try {
    const customerId = invoice.customer as string;
    
    console.log(`⚠️ Payment failed for customer ${customerId}`);
    
    // Handle failed payment
    // Maybe send notification email
    // Consider grace period before revoking access
    
  } catch (error) {
    console.error('❌ Error handling invoice payment failure:', error);
  }
}

export default router;