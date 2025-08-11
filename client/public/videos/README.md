# 🎬 Video Assets Directory

This directory contains video assets for the Wizard Chess Master landing page.

## Expected Files:

### Background Video
- `hero-background-animation.mp4` - Animated background for hero section
  - **Format**: MP4 (H.264 codec recommended for web compatibility)
  - **Dimensions**: 1920x1080px (16:9 ratio)
  - **Duration**: 10-30 seconds (loops automatically)
  - **File Size**: Under 5MB for fast loading
  - **Content**: Medieval fantasy scene with subtle animation
  - **Style**: Not too distracting, allows text overlay readability

## Technical Specifications:

### Video Optimization
- **Codec**: H.264 for maximum browser compatibility
- **Bitrate**: 1-2 Mbps for good quality/size balance  
- **Frame Rate**: 24-30 FPS
- **Audio**: None (muted for web performance)
- **Looping**: Seamless loop without jarring transitions

### Browser Support
- All modern browsers support MP4 with H.264
- Automatic fallback to gradient background if video fails
- Mobile-optimized with `playsInline` attribute
- Autoplay with muted audio (follows browser policies)

## Usage:
Upload your MP4 file and the AnimatedHeroBanner will automatically display it as a looping background behind your chess board image.