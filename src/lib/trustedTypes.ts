/**
 * Trusted Types policy for CSP compliance
 * This creates a permissive policy that allows innerHTML usage from trusted libraries
 * like AG Grid, Lucide icons, etc.
 */

export const initTrustedTypes = () => {
  if (typeof window === "undefined") return;

  // Check if Trusted Types API is available and not already configured
  if (window.trustedTypes && !window.trustedTypes.defaultPolicy) {
    try {
      window.trustedTypes.createPolicy("default", {
        createHTML: (input: string) => input,
        createScript: (input: string) => input,
        createScriptURL: (input: string) => input,
      });
      console.log("Trusted Types default policy created");
    } catch (e) {
      // Policy might already exist or Trusted Types not fully supported
      console.warn("Could not create Trusted Types policy:", e);
    }
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (
        name: string,
        rules: {
          createHTML?: (input: string) => string;
          createScript?: (input: string) => string;
          createScriptURL?: (input: string) => string;
        }
      ) => unknown;
      defaultPolicy?: unknown;
    };
  }
}
