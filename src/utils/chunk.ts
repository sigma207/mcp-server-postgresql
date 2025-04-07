import {
  TableSchema,
} from '../ts/types/query-result'

export const generateChunkText = (schemas: TableSchema[]): string => {
  // 依 tableName 分組
  const tableSchemaMap = new Map<string, TableSchema[]>()

  schemas.forEach((schema) => {
    if (!tableSchemaMap.has(schema.tableName)) {
      tableSchemaMap.set(schema.tableName, [])
    }
    const columns = tableSchemaMap.get(schema.tableName)
    if (!columns) {
      throw new Error('Internal error: Table name not found')
    }
    columns.push(schema)
  })
  console.log(tableSchemaMap)

  let chunkText = ''
  for (const [
    tableName,
    columns,
  ] of tableSchemaMap.entries()) {
    chunkText += `Node: ${tableName}, label: table, properties: {id: ${tableName}}\n`
    // TODO: Table comment
    columns.forEach((col) => {
      // TODO: Column comment
      const columnNodeName = `${tableName}.${col.columnName}`
      let colText = `Node: ${columnNodeName}, label: column, properties: {id: ${columnNodeName}, columnName: ${col.columnName}, columnType: ${col.dataType}, table: ${tableName}}\n`
      colText += `Releation: ${columnNodeName} BELONGS_TO ${tableName}\n`
      if (col.foreignTableName && col.foreignColumnName) {
        const foreignNodeName = `${col.foreignTableName}.${col.foreignColumnName}`
        colText += `Releation: ${columnNodeName} FOREIGN_KEY_TO ${foreignNodeName}\n`
      }
      chunkText += colText + '\n'
    })
  }
  return chunkText
}
