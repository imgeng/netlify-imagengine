// This is the main file for the Netlify Build plugin 'netlify-imageengine'.

import fs from 'node:fs/promises'
import { glob } from 'glob'
import {
  ERROR_INVALID_PUBLISH_DIRECTORY,
  ERROR_NETLIFY_HOST_UNKNOWN,
  ERROR_DELIVERY_ADDRESS_REQUIRED,
} from './lib/errors.js'
import {
  updateHtmlImagesToImageEngine,
  processBundle,
} from './lib/imageengine.js'

export async function onPostBuild({ constants, inputs, utils }) {
  console.log('[ImageEngine] Replacing on-page images with ImageEngine URLs...')

  let host = process.env.URL
  if (
    process.env.CONTEXT === 'branch-deploy' ||
    process.env.CONTEXT === 'deploy-preview'
  ) {
    host = process.env.DEPLOY_PRIME_URL || ''
  }

  if (!host) {
    console.error(`[ImageEngine] ${ERROR_NETLIFY_HOST_UNKNOWN}`)
    utils.build.failPlugin(ERROR_NETLIFY_HOST_UNKNOWN)
    return
  }

  console.log(`[ImageEngine] Using host: ${host}`)

  const { deliveryAddress, directives } = inputs
  const { PUBLISH_DIR } = constants

  console.log(`[ImageEngine] PUBLISH_DIR: ${PUBLISH_DIR}`)

  if (!PUBLISH_DIR) {
    console.error(`[ImageEngine] ${ERROR_INVALID_PUBLISH_DIRECTORY}`)
    utils.build.failPlugin(ERROR_INVALID_PUBLISH_DIRECTORY)
    return
  }

  if (!deliveryAddress) {
    console.error(`[ImageEngine] ${ERROR_DELIVERY_ADDRESS_REQUIRED}`)
    utils.build.failPlugin(ERROR_DELIVERY_ADDRESS_REQUIRED)
    return
  }

  const files = glob.sync([
    `${PUBLISH_DIR}/**/*.html`,
    `${PUBLISH_DIR}/**/*.js`,
  ])

  const results = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(file, 'utf-8')

      if (file.endsWith('.html')) {
        const { html, errors } = await updateHtmlImagesToImageEngine(content, {
          deliveryAddress,
          directives,
        })
        await fs.writeFile(file, html)
        return { file, errors }
      } else {
        const processed = processBundle(content, {
          deliveryAddress,
          directives,
        })
        await fs.writeFile(file, processed)
        return { file, errors: [] }
      }
    }),
  )
  console.log(results)
}
