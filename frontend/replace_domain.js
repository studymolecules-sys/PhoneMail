async function replaceOldDomain() {
  const [{ default: fs }, { default: path }] = await Promise.all([
    import('node:fs'),
    import('node:path'),
  ])

  function walkDir(directory, visitFile) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        walkDir(filePath, visitFile)
      } else {
        visitFile(filePath)
      }
    }
  }

  walkDir('./src', (filePath) => {
    if (!/\.(?:ts|tsx|css)$/.test(filePath)) return

    const content = fs.readFileSync(filePath, 'utf8')
    if (!content.includes('phonemail.com')) return

    fs.writeFileSync(filePath, content.replace(/phonemail\.com/g, 'pmail.vixiya.com'), 'utf8')
    console.log('Updated:', filePath)
  })
}

replaceOldDomain().catch((error) => {
  console.error('Domain replacement failed:', error instanceof Error ? error.message : 'Unknown error')
  process.exitCode = 1
})
