/**
 * Payment utility functions for better error handling
 */

export const handlePaymentRedirect = (url: string): void => {
  console.log('🔄 Redirecting to payment checkout...');
  
  try {
    // First try to open in new tab
    const checkoutWindow = window.open(url, '_blank', 'noopener,noreferrer');
    
    if (!checkoutWindow || checkoutWindow.closed) {
      // If popup blocked, show user message and use current window
      console.log('💡 Popup blocked, redirecting in current window...');
      
      // Add a small delay to show the message
      setTimeout(() => {
        window.location.href = url;
      }, 1000);
      
      // Show loading message
      showPaymentLoadingMessage();
    } else {
      console.log('✅ Payment window opened successfully');
    }
  } catch (error) {
    console.error('❌ Payment redirect error:', error);
    // Fallback to current window redirect
    window.location.href = url;
  }
};

const showPaymentLoadingMessage = (): void => {
  // Create overlay message
  const overlay = document.createElement('div');
  overlay.id = 'payment-loading-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    color: white;
    font-family: Arial, sans-serif;
    text-align: center;
  `;
  
  overlay.innerHTML = `
    <div style="background: #1f2937; padding: 2rem; border-radius: 8px; max-width: 400px;">
      <div style="font-size: 1.5rem; margin-bottom: 1rem;">🔄 Redirecting to Payment...</div>
      <div style="margin-bottom: 1rem;">Please wait while we redirect you to secure checkout.</div>
      <div style="font-size: 0.9rem; color: #9ca3af;">If this takes too long, please check if popups are blocked.</div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Remove overlay after 5 seconds
  setTimeout(() => {
    const existingOverlay = document.getElementById('payment-loading-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }
  }, 5000);
};

export const handlePaymentError = (error: any): void => {
  console.error('❌ Payment error:', error);
  
  let message = 'Payment setup failed. Please try again.';
  
  if (error.message) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      message = 'Network error. Please check your connection and try again.';
    } else if (error.message.includes('stripe') || error.message.includes('payment')) {
      message = 'Payment service unavailable. Please try again later.';
    }
  }
  
  // Show user-friendly error message
  alert(message);
};