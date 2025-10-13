// Utility functions for favicon generation and management

export const createFaviconFromLogo = (logoUrl: string, size: number = 32): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = size;
    canvas.height = size;
    
    img.onload = () => {
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, size, size);
      
      // Draw the logo centered and scaled to fit
      const scale = Math.min(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Convert to data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => reject(new Error('Failed to load logo image'));
    img.src = logoUrl;
  });
};

export const updateFavicon = (faviconUrl: string) => {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel*="icon"]');
  existingLinks.forEach(link => link.remove());
  
  // Add new favicon
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = faviconUrl;
  document.head.appendChild(link);
  
  // Add apple touch icon
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = faviconUrl;
  document.head.appendChild(appleLink);
};

// Initialize favicon with FlowdeX logo
export const initializeFavicon = async () => {
  try {
    const faviconUrl = await createFaviconFromLogo('/logo/flowdex-logo.png', 32);
    updateFavicon(faviconUrl);
  } catch (error) {
    console.warn('Failed to create favicon from logo:', error);
    // Fallback to direct logo usage
    updateFavicon('/logo/flowdex-logo.png');
  }
};