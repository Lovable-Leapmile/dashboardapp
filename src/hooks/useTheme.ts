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

// Logo for login page (colored logos)
export function useLoginLogo() {
  const [logo, setLogo] = useState<string>('');

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
            const bialLogo = await import('@/assets/logos/bial-logo.png');
            setLogo(bialLogo.default);
            break;
          case 'AMS_UI':
            const amsLogo = await import('@/assets/logos/ams-logo.png');
            setLogo(amsLogo.default);
            break;
          case 'DHL_UI':
            const dhlLogo = await import('@/assets/logos/dhl-logo.png');
            setLogo(dhlLogo.default);
            break;
          default:
            const defaultLogo = await import('@/assets/logo.png');
            setLogo(defaultLogo.default);
        }
      } catch {
        const defaultLogo = await import('@/assets/logo.png');
        setLogo(defaultLogo.default);
      }
    };

    loadLogo();
  }, []);

  return logo;
}

// Logo for header (white logo for LEAPMILE_UI, same as login for others)
export function useCurrentLogo() {
  const [logo, setLogo] = useState<string>('');

  useEffect(() => {
    const loadLogo = async () => {
      const skin = getCurrentSkin();
      
      try {
        switch (skin) {
          case 'LEAPMILE_UI':
            // Use white header logo for LEAPMILE_UI in dashboard
            const headerLogo = await import('@/assets/header-logo.png');
            setLogo(headerLogo.default);
            break;
          case 'BIAL_UI':
            const bialLogo = await import('@/assets/logos/bial-logo.png');
            setLogo(bialLogo.default);
            break;
          case 'AMS_UI':
            const amsLogo = await import('@/assets/logos/ams-logo.png');
            setLogo(amsLogo.default);
            break;
          case 'DHL_UI':
            const dhlLogo = await import('@/assets/logos/dhl-logo.png');
            setLogo(dhlLogo.default);
            break;
          default:
            const headerLogoDefault = await import('@/assets/header-logo.png');
            setLogo(headerLogoDefault.default);
        }
      } catch {
        const headerLogo = await import('@/assets/header-logo.png');
        setLogo(headerLogo.default);
      }
    };

    loadLogo();
  }, []);

  return logo;
}
