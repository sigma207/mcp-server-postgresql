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
    chunkText += `Table Name: ${tableName}\n`
    // TODO: Table comment
    // chunkText += `Table description: ${tableName} 相關的資料。\n`
    chunkText += `Columns:\n`

    columns.forEach((col) => {
      // TODO: Column comment
      let colText = `- ${col.columnName} (${col.dataType})`
      if (col.foreignTableName && col.foreignColumnName) {
        colText += `, Foreign Key: ${col.foreignTableName}.${col.foreignColumnName}`
      }
      chunkText += colText + '\n'
    })
  }
  return chunkText
}
