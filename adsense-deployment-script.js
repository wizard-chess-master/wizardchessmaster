/**
 * AdSense Integration Script for Wizard Chess Master
 * 
 * Replace YOUR_ADSENSE_PUBLISHER_ID with your actual AdSense publisher ID
 * before deploying to production.
 * 
 * Instructions:
 * 1. Get your AdSense publisher ID from Google AdSense dashboard
 * 2. Replace "YOUR_ADSENSE_PUBLISHER_ID" with your actual ID (ca-pub-xxxxxxxxxx)
 * 3. Add this script to your HTML head section or run it after page load
 */

// AdSense Configuration - UPDATE BEFORE DEPLOYMENT
const ADSENSE_CONFIG = {
  publisherId: "YOUR_ADSENSE_PUBLISHER_ID", // Replace with your actual publisher ID
  enabled: false // Set to true when ready to deploy with real AdSense
};

// Function to initialize AdSense
function initializeAdSense() {
  if (!ADSENSE_CONFIG.enabled || ADSENSE_CONFIG.publisherId === "YOUR_ADSENSE_PUBLISHER_ID") {
    console.log("AdSense not configured - using placeholder mode");
    return;
  }

  try {
    // Create and load AdSense script
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Add error handling
    script.onerror = function() {
      console.warn("Failed to load AdSense script");
    };
    
    script.onload = function() {
      console.log("AdSense script loaded successfully");
      
      // Initialize adsbygoogle
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: ADSENSE_CONFIG.publisherId,
        enable_page_level_ads: true
      });
    };
    
    document.head.appendChild(script);
    
  } catch (error) {
    console.error("AdSense initialization error:", error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdSense);
} else {
  initializeAdSense();
}

// Export for manual initialization if needed
window.initializeAdSense = initializeAdSense;