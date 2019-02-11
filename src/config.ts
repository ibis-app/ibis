export const port = parseInt(process.env['PORT']) || 3000
export const hostname = process.env['HOSTNAME'] || 'localhost'
export const appHostname = `http://${hostname}:${port}`
