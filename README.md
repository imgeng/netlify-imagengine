# Netlify ImageEngine Plugin

The Netlify ImageEngine plugin optimizes your images by up to 80% on autopilot,
enhancing SEO, reducing bounce rates, improving mobile experiences, and boosting
sales.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/integration/start/deploy?repository=https://github.com/AdityaKantipudi1/plugin-demo)

## Installation

Install this plugin from Netlify.

NPM :
```npm i netlify-plugin-imageengine```

## example netlify.toml
```
[[plugins]]
package = "netlify-plugin-imageengine"

  [plugins.inputs]
  deliveryAddress = "blazing-fast-pics.cdn.imgeng.in"

  [plugins.inputs.directives]
  height = 600
  width = 700
  rotate = 90
```

## Configuration

The following `inputs` options are available:

- `deliveryAddress`: The ImageEngine delivery address.
- `directives`: Optional image transformation directives.

## Features

### Image Optimization

- **Automatic URL Replacement**: The plugin scans HTML files and replaces image
  URLs with optimized ImageEngine URLs using the `updateHtmlImagesToImageEngine`
  function.
- **`srcset` Handling**: It updates `srcset` attributes to ensure all image
  sources are optimized, improving loading times and image quality across
  different devices.

- **Error Handling**: The plugin logs errors encountered during the URL
  transformation process, ensuring smooth operation and easy debugging.

### Build Process Integration

- **Netlify Build Plugin**: The `onPostBuild` function integrates with Netlify's
  build process, automatically optimizing images after the build completes.

- **Environment Context Awareness**: The plugin adapts to different Netlify
  deployment contexts (e.g., branch deploys, deploy previews) by using the
  appropriate host URL.

- **Configuration Validation**: It checks for necessary configurations like
  `deliveryAddress` and `PUBLISH_DIR`, failing gracefully with informative error
  messages if they are missing.

## Code Overview

### `updateHtmlImagesToImageEngine`

This function takes HTML content and options, then updates image URLs to use
ImageEngine for optimization. It handles both `src` and `srcset` attributes,
ensuring all images are optimized.

### `transformSrcURL`

This function transforms original image URLs to use the ImageEngine delivery
address. It handles different types of URLs:

- **Remote URLs**: Transforms fully-qualified URLs (e.g., starting with
  "http://" or "https://") and protocol-relative URLs (e.g., starting with
  "//").
- **Local URLs**: Transforms local paths to use the ImageEngine delivery
  address, ensuring all images are served through ImageEngine for optimization.

It ensures that the final URL is correctly formatted and ready for ImageEngine
processing.
