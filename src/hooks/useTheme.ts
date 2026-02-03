import { useEffect, useState } from 'react';
import { getCurrentSkin, getCurrentLogo, applyTheme, type UISkin } from '@/lib/theme';

export function useTheme() {
  const [skin, setSkin] = useState<UISkin>(getCurrentSkin());
  const [logo, setLogo] = useState<string>(getCurrentLogo());

  useEffect(() => {
    // Apply theme on mount
    applyTheme(skin);
    setLogo(getCurrentLogo());
  }, [skin]);

  return {
    skin,
    logo,
    setSkin,
  };
}

export function useCurrentLogo() {
  const [logo, setLogo] = useState<string>(() => {
    // Import the logo dynamically based on the current skin
    const skin = getCurrentSkin();
    
    // For LEAPMILE_UI, use the existing logo
    if (skin === 'LEAPMILE_UI') {
      return '';
    }
    
    return '';
  });

  useEffect(() => {
    const loadLogo = async () => {
      const skin = getCurrentSkin();
      
      try {
        switch (skin) {
          case 'LEAPMILE_UI':
            const leapmileLogo = await import('@/assets/logo.png');
            setLogo(leapmileLogo.default);
            break;
          case 'BIAL_UI':
            try {
              const bialLogo = await import('@/assets/logos/bial-logo.png');
              setLogo(bialLogo.default);
            } catch {
              // Fallback to default logo if BIAL logo doesn't exist
              const fallback = await import('@/assets/logo.png');
              setLogo(fallback.default);
            }
            break;
          case 'AMS_UI':
            try {
              const amsLogo = await import('@/assets/logos/ams-logo.png');
              setLogo(amsLogo.default);
            } catch {
              const fallback = await import('@/assets/logo.png');
              setLogo(fallback.default);
            }
            break;
          case 'DHL_UI':
            try {
              const dhlLogo = await import('@/assets/logos/dhl-logo.png');
              setLogo(dhlLogo.default);
            } catch {
              const fallback = await import('@/assets/logo.png');
              setLogo(fallback.default);
            }
            break;
          default:
            const defaultLogo = await import('@/assets/logo.png');
            setLogo(defaultLogo.default);
        }
      } catch {
        // Ultimate fallback
        const defaultLogo = await import('@/assets/logo.png');
        setLogo(defaultLogo.default);
      }
    };

    loadLogo();
  }, []);

  return logo;
}
