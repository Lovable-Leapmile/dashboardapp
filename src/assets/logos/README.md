# Logo Assets Directory

This directory is for storing client-specific logos for different UI skins.

## Required Files

When deploying with a specific UI skin, add the corresponding logo file:

- **BIAL_UI**: `bial-logo.png` - Bangalore International Airport Limited logo
- **AMS_UI**: `ams-logo.png` - Ace Micromatic Group logo  
- **DHL_UI**: `dhl-logo.png` - DHL logo

## Usage

The application will automatically use the appropriate logo based on the `VITE_DEPLOYMENT_CSS_SKIN` environment variable.

If the specific logo file is not found, the application falls back to the default Leapmile logo (`src/assets/logo.png`).

## Logo Guidelines

- Recommended format: PNG with transparency
- Recommended size: 200-300px width
- The logo will be displayed at ~90px width in the header and ~220px on the login page
