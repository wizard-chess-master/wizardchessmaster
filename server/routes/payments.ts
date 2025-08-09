/**
 * Stripe Payment Processing Routes
 */

import { Router, Request, Response } from "express";
import Stripe from "stripe";

const router = Router();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

// Payment plans configuration
const PAYMENT_PLANS = {
  'premium-monthly': {
    stripePriceId: process.env.STRIPE_PRICE_ID || 'price_premium_monthly',
    name: 'Wizard Chess Premium',
    type: 'subscription' as const
  }
};

/**
 * Create Stripe Checkout Session for subscription
 */
router.post("/create-checkout-session", async (req: Request, res: Response) => {
  try {
    const { planId } = req.body;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const plan = PAYMENT_PLANS[planId as keyof typeof PAYMENT_PLANS];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }

    // Get the base URL for success/cancel redirects
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPLIT_DEV_DOMAIN || 'your-app.replit.app'}`
      : `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        planId: planId,
        userId: 'anonymous' // Will be enhanced with actual user sessions later
      }
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Create Stripe Checkout Session for one-time payment
 */
router.post("/create-payment-session", async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `https://${process.env.REPLIT_DEV_DOMAIN || 'your-app.replit.app'}`
      : `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'Wizard Chess Premium Upgrade',
              description: 'One-time premium upgrade for Wizard Chess'
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        type: 'one-time-upgrade',
        userId: 'anonymous' // Will be enhanced with actual user sessions later
      }
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({ 
      error: 'Failed to create payment session',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Verify checkout session
 */
router.get("/verify-session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      metadata: session.metadata
    });

  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ 
      error: 'Failed to verify session',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Get Stripe configuration for client
 */
router.get("/config", (req: Request, res: Response) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    configured: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY)
  });
});

export default router;