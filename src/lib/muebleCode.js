import { customAlphabet } from 'nanoid'

// Unambiguous alphabet — no 0/O, 1/I/L confusion
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const generate = customAlphabet(alphabet, 4)

export const generateMuebleCode = () => 'MB-' + generate()
