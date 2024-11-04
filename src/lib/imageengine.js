import { JSDOM } from 'jsdom'
import { build_IE_url } from '@imageengine/imageengine-helpers'

export async function updateHtmlImagesToImageEngine(html, options) {
  const { deliveryAddress, directives } = options

  const errors = []
  const dom = new JSDOM(html)

  // Loop through all images found in the DOM and swap the source with
  // a ImageEngine URL
  if (dom != null) {
    const images = Array.from(dom.window.document.querySelectorAll('img'))
    for (const $img of images) {
      const imgSrc = $img.getAttribute('src')
      if (imgSrc.length > 1) {
        let transformedSrc = ''
        transformedSrc = transformSrcURL(imgSrc, deliveryAddress)
        if (transformedSrc.length > 1) {
          let ie_directives = directives != null ? directives : []
          let ieURL = build_IE_url(transformedSrc, ie_directives)
          $img.setAttribute('src', ieURL)
        }
      }

      // Handle srcset attribute
      const imgSrcset = $img.getAttribute('srcset')
      if (imgSrcset) {
        const transformedSrcset = imgSrcset
          .split(',')
          .map((src) => {
            const [url, descriptor] = src.trim().split(' ')
            let transformedUrl = transformSrcURL(url, deliveryAddress)
            transformedUrl = build_IE_url(transformedUrl, directives || [])
            return `${transformedUrl} ${descriptor || ''}`
          })
          .join(', ')
        $img.setAttribute('srcset', transformedSrcset)
      }
    }
    return { html: dom.serialize(), errors }
  }
}

// Process any valid image URL pattern
export function processBundle(content, options) {
  const { deliveryAddress, directives } = options
  return content.replace(
    /(["'])((?:https?:\/\/)?[^"']+)(\.(?:jpg|jpeg|png|gif|webp|avif))(["'])/gi,
    (_, q1, path, ext, q2) => {
      let transformedSrc = transformSrcURL(path + ext, deliveryAddress)
      let ie_directives = directives != null ? directives : []
      let ieURL = build_IE_url(transformedSrc, ie_directives)
      return q1 + ieURL + q2
    },
  )
}

export function transformSrcURL(orgURL, deliveryAddress) {
  let finalSrc = ''

  if (isRemoteURL(orgURL)) {
    // Handle protocol-relative URLs (starting with "//")
    if (orgURL.startsWith('//')) {
      let srcArray = orgURL.slice(2).split('/')
      let length = srcArray.length
      let imageName = srcArray[length - 1]
      finalSrc = '//' + deliveryAddress + '/' + imageName
    } else {
      // Handle fully-qualified URLs (starting with "http://" or "https://")
      let srcURL = orgURL.split('://')
      if (srcURL.length > 1) {
        let urlPrefix = srcURL[0]
        let srcArray = srcURL[1].split('/')
        let length = srcArray.length
        let imageName = srcArray[length - 1]
        finalSrc = urlPrefix + '://' + deliveryAddress + '/' + imageName
      }
    }
  } else {
    // Handle non-remote URLs (local paths)
    if (
      deliveryAddress.startsWith('http://') ||
      deliveryAddress.startsWith('https://') ||
      deliveryAddress.startsWith('//')
    ) {
      finalSrc = `${deliveryAddress.replace(/\/$/, '')}/${orgURL.replace(
        /^\//,
        '',
      )}`
    } else {
      finalSrc = `//${deliveryAddress.replace(/\/$/, '')}/${orgURL.replace(
        /^\//,
        '',
      )}`
    }
  }

  return finalSrc
}

export function isRemoteURL(orgURL) {
  return (
    orgURL.startsWith('https') ||
    orgURL.startsWith('http') ||
    orgURL.startsWith('//')
  )
}
