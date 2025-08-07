/**
 * Payment Manager for Wizard Chess
 * Handles Stripe integration for ad-free upgrade purchase
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getAdManager } from './adManager';

export interface PaymentManager {
  initialize(): Promise<void>;
  createUpgradeSession(): Promise<string | null>;
  handleUpgradeSuccess(): void;
  showUpgradeDialog(): void;
}

class StripePaymentManager implements PaymentManager {
  private stripe: Stripe | null = null;
  private isInitialized = false;
  private publishableKey = 'pk_test_demo'; // Replace with real Stripe publishable key

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.stripe = await loadStripe(this.publishableKey);
      this.isInitialized = true;
      console.log('💳 Stripe initialized successfully');
      
      // Listen for upgrade prompts
      window.addEventListener('show-upgrade-prompt', () => {
        this.showUpgradeDialog();
      });
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error);
    }
  }

  async createUpgradeSession(): Promise<string | null> {
    if (!this.stripe) {
      console.error('❌ Stripe not initialized');
      return null;
    }

    try {
      // In a real app, this would call your backend to create a Stripe session
      // For demo purposes, we'll simulate the purchase flow
      console.log('💳 Creating upgrade session...');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo, we'll just grant ad-free status
      this.handleUpgradeSuccess();
      return 'demo-session-id';
    } catch (error) {
      console.error('❌ Payment session creation failed:', error);
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

  showUpgradeDialog(): void {
    // Create upgrade dialog
    const overlay = document.createElement('div');
    overlay.id = 'upgrade-overlay';
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
    dialog.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        max-width: 400px;
        color: white;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <h2 style="margin: 0 0 20px 0; font-size: 24px;">🧙‍♂️ Wizard Chess Premium</h2>
        <div style="margin-bottom: 25px;">
          <p style="margin: 10px 0; font-size: 16px;">✨ Remove all ads forever</p>
          <p style="margin: 10px 0; font-size: 16px;">🎯 Unlimited hints & undos</p>
          <p style="margin: 10px 0; font-size: 16px;">🏆 Premium wizard themes</p>
          <p style="margin: 10px 0; font-size: 16px;">⚡ Faster game loading</p>
        </div>
        <div style="margin-bottom: 25px;">
          <div style="font-size: 36px; font-weight: bold; color: #FFD700;">$2.99</div>
          <div style="font-size: 14px; opacity: 0.8;">One-time purchase</div>
        </div>
        <div>
          <button id="purchase-btn" style="
            background: #FFD700;
            color: #333;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-right: 10px;
            transition: all 0.3s;
          ">Purchase Now</button>
          <button id="close-upgrade" style="
            background: transparent;
            color: white;
            border: 2px solid white;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
          ">Maybe Later</button>
        </div>
        <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
          Secure payment powered by Stripe
        </div>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Add hover effects
    const purchaseBtn = document.getElementById('purchase-btn');
    if (purchaseBtn) {
      purchaseBtn.addEventListener('mouseenter', () => {
        purchaseBtn.style.transform = 'scale(1.05)';
        purchaseBtn.style.background = '#FFC107';
      });
      purchaseBtn.addEventListener('mouseleave', () => {
        purchaseBtn.style.transform = 'scale(1)';
        purchaseBtn.style.background = '#FFD700';
      });
    }

    // Handle interactions
    const closeBtn = document.getElementById('close-upgrade');
    const buyBtn = document.getElementById('purchase-btn');

    const cleanup = () => {
      document.body.removeChild(overlay);
    };

    closeBtn?.addEventListener('click', cleanup);
    buyBtn?.addEventListener('click', async () => {
      buyBtn.innerHTML = '⏳ Processing...';
      buyBtn.style.background = '#9E9E9E';
      buyBtn.style.cursor = 'not-allowed';
      
      const sessionId = await this.createUpgradeSession();
      if (sessionId) {
        cleanup();
      } else {
        buyBtn.innerHTML = 'Purchase Now';
        buyBtn.style.background = '#FFD700';
        buyBtn.style.cursor = 'pointer';
      }
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup();
    });
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

    const message = document.createElement('div');
    message.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        max-width: 300px;
        color: white;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
        <h2 style="margin: 0 0 15px 0; font-size: 20px;">Welcome to Premium!</h2>
        <p style="margin: 0 0 20px 0; opacity: 0.9;">All ads have been removed. Enjoy your enhanced Wizard Chess experience!</p>
        <button id="success-ok" style="
          background: white;
          color: #4CAF50;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        ">Awesome!</button>
      </div>
    `;

    overlay.appendChild(message);
    document.body.appendChild(overlay);

    const okBtn = document.getElementById('success-ok');
    okBtn?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // Auto-close after 5 seconds
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