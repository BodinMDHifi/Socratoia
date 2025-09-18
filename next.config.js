/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Ensure native modules are treated as external in server components/routes
    serverComponentsExternalPackages: ['@napi-rs/canvas'],
  },
  webpack: (config, { isServer }) => {
    // We don't render PDFs in the browser (we convert to images server-side).
    // Some packages expect the old pdfjs worker entry path; stub it to avoid build errors.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pdfjs-dist/build/pdf.worker.entry': false,
      // Prevent accidental client-side import of native canvas
      '@napi-rs/canvas': isServer ? '@napi-rs/canvas' : false,
    };

    // Externalize native addon on the server so Webpack doesn’t try to parse the .node binary
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@napi-rs/canvas');
      }
    }
    return config;
  },
};

module.exports = nextConfig;
