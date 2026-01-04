// Bundle analysis script for Dashboard code splitting
const fs = require('fs')
const path = require('path')

// Analyze the generated chunks
const distPath = path.join(__dirname, 'dist')

if (fs.existsSync(distPath)) {
    const assetsPath = path.join(distPath, 'assets')
    if (fs.existsSync(assetsPath)) {
        const files = fs.readdirSync(assetsPath)
        const jsFiles = files.filter(file => file.endsWith('.js'))

        console.log('📦 Bundle Analysis Results:')
        console.log('==========================')

        jsFiles.forEach(file => {
            const filePath = path.join(assetsPath, file)
            const stats = fs.statSync(filePath)
            const sizeKB = (stats.size / 1024).toFixed(2)

            // Try to identify chunk type
            let chunkType = 'unknown'
            if (file.includes('dashboard')) chunkType = 'Dashboard'
            else if (file.includes('wallet')) chunkType = 'Wallet'
            else if (file.includes('transaction')) chunkType = 'Transaction'
            else if (file.includes('trade')) chunkType = 'Trade'
            else if (file.includes('shared')) chunkType = 'Shared'
            else if (file.includes('vendor')) chunkType = 'Vendor'
            else if (file.includes('main')) chunkType = 'Main'

            console.log(`${chunkType.padEnd(12)}: ${sizeKB} KB - ${file}`)
        })

        console.log('\n💡 Code Splitting Recommendations:')
        console.log('- Each business module should be < 100KB')
        console.log('- Shared libraries should be in separate chunks')
        console.log('- Consider lazy loading heavy components')
    } else {
        console.log('❌ No assets directory found. Run build first.')
    }
} else {
    console.log('❌ No dist directory found. Run build first.')
}
