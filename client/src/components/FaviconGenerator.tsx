// This component can be used to generate favicon data URLs
export const generateFaviconDataURL = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 32, 32);
  gradient.addColorStop(0, '#00D4FF');
  gradient.addColorStop(0.5, '#00D4FF');
  gradient.addColorStop(1, '#5B82F6');
  
  // Draw rounded rectangle background
  ctx.fillStyle = gradient;
  ctx.roundRect(0, 0, 32, 32, 8);
  ctx.fill();
  
  // Draw F + X logo
  ctx.fillStyle = 'white';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FX', 16, 16);
  
  return canvas.toDataURL();
};

// Helper function to set favicon dynamically
export const setDynamicFavicon = () => {
  const faviconUrl = generateFaviconDataURL();
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = faviconUrl;
  document.getElementsByTagName('head')[0].appendChild(link);
};