import jwt from 'jsonwebtoken'

export function getAdminFromToken(req) {
  try {
    const header = req?.headers?.authorization || ''
    if (!header.startsWith('Bearer ')) return null
    const token = header.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export function requireAdmin(context) {
  if (!context.admin) {
    throw new Error('No autorizado')
  }
}
