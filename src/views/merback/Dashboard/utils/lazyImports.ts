// Preload critical libraries that are used in the Dashboard
export const preloadCriticalLibraries = async () => {
    // Preload commonly used libraries after initial render
    try {
        await Promise.all([
            import('dayjs'),
            import('lodash/cloneDeep'),
            import('react-number-format')
        ])
    } catch (error) {
        // Silent fail for preloading - not critical for app functionality
        console.warn('Failed to preload some libraries:', error)
    }
}
