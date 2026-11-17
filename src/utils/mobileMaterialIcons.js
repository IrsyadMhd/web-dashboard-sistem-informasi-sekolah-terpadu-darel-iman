import { useEffect, useState } from 'react'
import { addCollection } from '@iconify/react'

let cachedIconNames = null
let loadingPromise = null

/**
 * Lazy-load the offline Iconify MDI collection and the list of 7,447 icon names
 * verified to exist in mobile-app's MaterialCommunityIcons glyphMap.
 */
export async function loadMobileMaterialIcons() {
  if (cachedIconNames) {
    return cachedIconNames
  }

  if (!loadingPromise) {
    loadingPromise = Promise.all([
      import('@iconify-json/mdi/icons.json'),
      import('../constants/mobileMaterialIcons.json'),
    ])
      .then(([mdiModule, namesModule]) => {
        const mdiData = mdiModule?.default || mdiModule
        const names = namesModule?.default || namesModule || []
        if (mdiData && mdiData.icons) {
          addCollection(mdiData)
        }
        cachedIconNames = Array.isArray(names) ? names : []
        return cachedIconNames
      })
      .catch((err) => {
        loadingPromise = null
        throw err
      })
  }

  return loadingPromise
}

/**
 * React hook that initializes offline MDI icon rendering and returns
 * `{ mdiReady, androidMaterialIconNames }`.
 */
export function useMobileMaterialIcons() {
  const [state, setState] = useState(() => ({
    mdiReady: Boolean(cachedIconNames),
    androidMaterialIconNames: cachedIconNames || [],
  }))

  useEffect(() => {
    if (cachedIconNames) {
      setState({ mdiReady: true, androidMaterialIconNames: cachedIconNames })
      return
    }
    let mounted = true
    loadMobileMaterialIcons()
      .then((names) => {
        if (mounted) {
          setState({ mdiReady: true, androidMaterialIconNames: names })
        }
      })
      .catch(() => {
        // Fallback preview continues via Lucide mapping
      })
    return () => {
      mounted = false
    }
  }, [])

  return state
}

