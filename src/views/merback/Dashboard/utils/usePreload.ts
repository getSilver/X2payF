import { useEffect } from 'react'
import { preloadCriticalLibraries } from './lazyImports'

export const usePreload = (enabled: boolean = true) => {
    useEffect(() => {
        if (enabled && typeof window !== 'undefined') {
            // Preload critical libraries after initial render
            const timer = setTimeout(() => {
                preloadCriticalLibraries().catch(() => {
                    // Ignore preloading errors
                })
            }, 100)

            return () => clearTimeout(timer)
        }
    }, [enabled])
}

export default usePreload
