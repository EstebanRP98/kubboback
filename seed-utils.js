// Helper compartido por los scripts seed-*.js.
//
// NO destructivo: crea solo los registros que faltan y nunca borra ni sobrescribe lo que ya
// existe. El catálogo real se administra desde el panel (/admin), así que estos scripts son
// seguros de correr contra una BD que ya tiene datos.
//
// `keyField` es la clave natural que decide si un registro ya existe: `key` en los modelos que
// la tienen y `name` en los que no. Consecuencias: si borraste a propósito un registro del seed
// se vuelve a crear, y si renombraste desde el admin uno que se identifica por `name`, se
// volverá a crear el original.
export async function seedMissing(Model, docs, label, keyField = 'key') {
  const created = []
  for (const doc of docs) {
    // Sin esta guarda, un keyField equivocado haría que `exists` coincida con cualquier
    // registro y el seed no crearía nada en silencio.
    if (doc[keyField] == null) {
      throw new Error(`seedMissing(${label}): falta el campo '${keyField}' en un registro del seed`)
    }
    if (await Model.exists({ [keyField]: doc[keyField] })) continue
    created.push(await Model.create(doc))
  }
  console.log(`✅ ${label}: ${created.length} creados, ${docs.length - created.length} ya existían (sin tocar)`)
  return created
}
