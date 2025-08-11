// Test script to verify premium UI updates
console.log('🧪 Testing Premium UI Updates');

// Test premium status detection in browser
if (typeof window !== 'undefined') {
  // Listen for premium updates
  window.addEventListener('premium-status-updated', (event) => {
    console.log('✅ Premium status event received:', event.detail);
  });
  
  // Simulate login and check UI updates
  async function testPremiumUI() {
    try {
      console.log('🔑 Testing login...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'Tokingteepee', password: 'WizardChess123!' }),
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('📊 Login response:', data);
      
      if (data.success && data.user && data.user.isPremium) {
        console.log('✅ Premium user confirmed');
        
        // Check for premium UI elements
        setTimeout(() => {
          const premiumBadge = document.querySelector('[data-premium-badge]');
          const upgradeBtns = document.querySelectorAll('button:contains("Upgrade")');
          const crownIcons = document.querySelectorAll('[data-icon="crown"]');
          
          console.log('🎯 UI Elements found:', {
            premiumBadges: premiumBadge ? 1 : 0,
            upgradeButtons: upgradeBtns.length,
            crownIcons: crownIcons.length
          });
          
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
  
  // Run test after page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testPremiumUI);
  } else {
    testPremiumUI();
  }
}