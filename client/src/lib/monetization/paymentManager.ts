/**
 * Payment Manager for Wizard Chess
 * Handles Stripe integration for ad-free upgrade purchase
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getAdManager } from './adManager';
import { handlePaymentRedirect, handlePaymentError } from '../utils/paymentUtils';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  type: 'one-time' | 'subscription';
  interval?: 'month' | 'year';
  features: string[];
  stripePriceId?: string;
}

export interface PaymentManager {
  initialize(): Promise<void>;
  createUpgradeSession(planId: string): Promise<string | null>;
  createSubscriptionSession(planId: string): Promise<string | null>;
  handleUpgradeSuccess(): void;
  handleSubscriptionSuccess(): void;
  showUpgradeDialog(): void;
  showPlanSelector(): void;
  isUserPremium(): boolean;
  getUserPlan(): PaymentPlan | null;
}

// A/B Testing price variants for optimization
const PRICE_VARIANTS = [4.99, 5.00, 5.99, 6.99];
const getCurrentPrice = (): number => {
  // Simple A/B testing based on user ID hash or random selection
  const savedPrice = localStorage.getItem('wizard-chess-price-variant');
  if (savedPrice) return parseFloat(savedPrice);
  
  const randomPrice = PRICE_VARIANTS[Math.floor(Math.random() * PRICE_VARIANTS.length)];
  localStorage.setItem('wizard-chess-price-variant', randomPrice.toString());
  return randomPrice;
};

// Streamlined single subscription plan
const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'premium-monthly',
    name: 'Wizard Chess Premium',
    price: getCurrentPrice(),
    currency: 'USD',
    type: 'subscription',
    interval: 'month',
    features: [
      '🚫 Remove all advertisements',
      '🏆 Unlock full campaign mode',
      '♾️ Unlimited hints & undos',
      '🎨 Exclusive board themes & pieces',
      '🤖 Advanced AI training modes',
      '☁️ Cloud save synchronization',
      '🎯 Priority customer support',
      '🧪 Beta access to new features'
    ],
    stripePriceId: 'price_premium_monthly'
  }
];

class StripePaymentManager implements PaymentManager {
  private stripe: Stripe | null = null;
  private isInitialized = false;
  private publishableKey = '';
  private userPlan: PaymentPlan | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get Stripe configuration from server
      const configResponse = await fetch('/api/payments/config');
      const config = await configResponse.json();
      
      if (!config.configured) {
        console.log('⚠️ Stripe not fully configured - some keys may be missing');
      }
      
      this.publishableKey = config.publishableKey || '';
      
      if (!this.publishableKey) {
        console.warn('⚠️ Stripe publishable key not configured - payment features disabled');
        this.isInitialized = true; // Mark as initialized but without Stripe
        return;
      }

      this.stripe = await loadStripe(this.publishableKey);
      this.isInitialized = true;
      this.loadUserPlan();
      console.log('💳 Stripe initialized successfully');
      
      // Listen for upgrade prompts
      window.addEventListener('show-upgrade-prompt', () => {
        this.showPlanSelector();
      });
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error);
    }
  }

  private loadUserPlan(): void {
    const savedPlan = localStorage.getItem('wizard-chess-user-plan');
    if (savedPlan) {
      this.userPlan = JSON.parse(savedPlan);
    }
  }

  private saveUserPlan(): void {
    if (this.userPlan) {
      localStorage.setItem('wizard-chess-user-plan', JSON.stringify(this.userPlan));
    }
  }

  async createUpgradeSession(planId: string): Promise<string | null> {
    if (!this.stripe) {
      console.error('❌ Stripe not initialized');
      return null;
    }

    const plan = PAYMENT_PLANS.find(p => p.id === planId);
    if (!plan) {
      console.error('❌ Invalid plan ID:', planId);
      return null;
    }

    try {
      console.log('💳 Creating upgrade session for plan:', plan.name);
      
      // Create one-time payment session for upgrades
      const response = await fetch('/api/payments/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: plan.currency.toLowerCase()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment session creation failed');
      }

      const { sessionId, url } = await response.json();
      
      if (url) {
        handlePaymentRedirect(url);
        return sessionId;
      }

      return sessionId;
    } catch (error) {
      handlePaymentError(error);
      return null;
    }
  }

  async createSubscriptionSession(planId: string): Promise<string | null> {
    if (!this.stripe) {
      console.error('❌ Stripe not initialized');
      return null;
    }

    const plan = PAYMENT_PLANS.find(p => p.id === planId && p.type === 'subscription');
    if (!plan) {
      console.error('❌ Invalid subscription plan ID:', planId);
      return null;
    }

    try {
      console.log('💳 Creating subscription session for plan:', plan.name);
      
      // Create subscription checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Subscription session creation failed');
      }

      const { sessionId, url } = await response.json();
      
      if (url) {
        handlePaymentRedirect(url);
        return sessionId;
      }

      return sessionId;
    } catch (error) {
      handlePaymentError(error);
      return null;
    }
  }

  handleUpgradeSuccess(): void {
    console.log('✅ Upgrade successful! Removing ads...');
    
    // Set ad-free status
    const adManager = getAdManager();
    adManager.setAdFreeStatus(true);
    
    // Show success message
    this.showSuccessMessage();
  }

  async verifyPaymentSuccess(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payments/verify-session/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Session verification failed: ${response.statusText}`);
      }

      const { status, metadata } = await response.json();
      
      if (status === 'paid') {
        // Find the plan from metadata
        const planId = metadata?.planId;
        if (planId) {
          const plan = PAYMENT_PLANS.find(p => p.id === planId);
          if (plan) {
            this.userPlan = plan;
            this.saveUserPlan();
            
            if (plan.type === 'subscription') {
              this.handleSubscriptionSuccess();
            } else {
              this.handleUpgradeSuccess();
            }
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      return false;
    }
  }

  handleSubscriptionSuccess(): void {
    console.log('✅ Subscription successful! Premium features unlocked...');
    
    // Set ad-free status
    const adManager = getAdManager();
    adManager.setAdFreeStatus(true);
    
    // Show subscription success message
    this.showSubscriptionSuccessMessage();
  }

  isUserPremium(): boolean {
    return this.userPlan !== null;
  }

  getUserPlan(): PaymentPlan | null {
    return this.userPlan;
  }

  showPlanSelector(): void {
    // Create plan selector dialog
    const overlay = document.createElement('div');
    overlay.id = 'plan-selector-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(135deg, #4a2c2a, #2d1810);
      border-radius: 15px;
      padding: 30px;
      max-width: 600px;
      width: 90%;
      color: white;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 2px solid #8b6914;
    `;

    // Create safe DOM structure without innerHTML
    const container = document.createElement('div');
    container.style.textAlign = 'center';

    // Create title
    const title = document.createElement('h2');
    title.style.cssText = 'color: #ffd700; margin-bottom: 20px; font-size: 24px;';
    title.textContent = '🏆 Choose Your Adventure';
    container.appendChild(title);

    // Create plans container
    const plansContainer = document.createElement('div');
    plansContainer.style.cssText = 'display: flex; gap: 20px; margin: 20px 0;';

    // Create plan cards
    PAYMENT_PLANS.forEach(plan => {
      const planCard = document.createElement('div');
      planCard.style.cssText = `
        flex: 1;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #8b6914;
        border-radius: 10px;
        padding: 20px;
        cursor: pointer;
        transition: transform 0.3s;
      `;
      planCard.addEventListener('click', () => (window as any).selectPlan(plan.id));

      // Plan name
      const planName = document.createElement('h3');
      planName.style.cssText = 'color: #ffd700; margin-bottom: 10px;';
      planName.textContent = plan.name;
      planCard.appendChild(planName);

      // Plan price
      const planPrice = document.createElement('div');
      planPrice.style.cssText = 'font-size: 28px; font-weight: bold; margin: 15px 0;';
      planPrice.textContent = `$${plan.price}${plan.interval ? '/' + plan.interval : ''}`;
      planCard.appendChild(planPrice);

      // Plan features
      const featuresList = document.createElement('ul');
      featuresList.style.cssText = 'list-style: none; padding: 0; text-align: left; font-size: 14px;';
      
      plan.features.forEach(feature => {
        const featureItem = document.createElement('li');
        featureItem.style.cssText = 'margin: 5px 0;';
        featureItem.textContent = `✓ ${feature}`;
        featuresList.appendChild(featureItem);
      });
      
      planCard.appendChild(featuresList);
      plansContainer.appendChild(planCard);
    });

    container.appendChild(plansContainer);

    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.style.cssText = `
      background: #666;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 20px;
    `;
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => (window as any).closePlanSelector());
    container.appendChild(cancelButton);

    dialog.appendChild(container);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Add global handlers
    (window as any).selectPlan = async (planId: string) => {
      const plan = PAYMENT_PLANS.find(p => p.id === planId);
      if (plan) {
        if (plan.type === 'one-time') {
          await this.createUpgradeSession(planId);
        } else {
          await this.createSubscriptionSession(planId);
        }
        this.closePlanSelector();
      }
    };

    (window as any).closePlanSelector = () => {
      const overlay = document.getElementById('plan-selector-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    };
  }

  selectPlan = async (planId: string) => {
    const plan = PAYMENT_PLANS.find(p => p.id === planId);
    if (plan) {
      if (plan.type === 'one-time') {
        await this.createUpgradeSession(planId);
      } else {
        await this.createSubscriptionSession(planId);
      }
      this.closePlanSelector();
    }
  };

  closePlanSelector(): void {
    const overlay = document.getElementById('plan-selector-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }

  showUpgradeDialog(): void {
    this.showPlanSelector();
  }

  private showSubscriptionSuccessMessage(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(135deg, #2d5016, #1a3009);
      border: 3px solid #ffd700;
      border-radius: 15px;
      padding: 30px;
      text-align: center;
      color: white;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    dialog.innerHTML = `
      <div>
        <h2 style="color: #ffd700; margin-bottom: 20px;">🎉 Premium Activated!</h2>
        <p style="margin-bottom: 20px;">Your monthly subscription is now active!</p>
        <ul style="list-style: none; padding: 0; text-align: left;">
          <li>✓ All ads removed</li>
          <li>✓ Premium campaign unlocked</li>
          <li>✓ Unlimited hints & undos</li>
          <li>✓ Exclusive board themes</li>
        </ul>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="background: #8b6914; color: white; border: none; padding: 10px 20px; 
                       border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Continue
        </button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 5000);
  }

  private showSuccessMessage(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10002;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(135deg, #2d5016, #1a3009);
      border: 3px solid #ffd700;
      border-radius: 15px;
      padding: 30px;
      text-align: center;
      color: white;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    dialog.innerHTML = `
      <div>
        <h2 style="color: #ffd700; margin-bottom: 20px;">🎉 Premium Activated!</h2>
        <p style="margin-bottom: 20px;">Your one-time purchase is complete!</p>
        <ul style="list-style: none; padding: 0; text-align: left;">
          <li>✓ All ads removed forever</li>
          <li>✓ Campaign mode unlocked</li>
          <li>✓ Unlimited hints & undos</li>
          <li>✓ Premium board themes</li>
        </ul>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="background: #8b6914; color: white; border: none; padding: 10px 20px; 
                       border-radius: 5px; cursor: pointer; margin-top: 20px;">
          Continue
        </button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 5000);
  }
}

// Singleton instance
let paymentManager: PaymentManager | null = null;

export const getPaymentManager = (): PaymentManager => {
  if (!paymentManager) {
    paymentManager = new StripePaymentManager();
  }
  return paymentManager;
};

export const initializePayments = async (): Promise<void> => {
  const manager = getPaymentManager();
  await manager.initialize();
};