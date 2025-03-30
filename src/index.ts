import {
  Server,
} from '@modelcontextprotocol/sdk/server/index.js'
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import pg from 'pg'

const server = new Server({
  name: 'postgres',
  version: '0.1.0',
}, {
  capabilities: {
    resources: {},
    tools: {},
  },
})

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Please provide a database URL as a command-line argument')
  process.exit(1)
}

const databaseUrl = args[0]

const resourceBaseUrl = new URL(databaseUrl)
resourceBaseUrl.protocol = 'postgres:'
resourceBaseUrl.password = ''

const pool = new pg.Pool({
  connectionString: databaseUrl,
})

const SCHEMA_PATH = 'schema'

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const client = await pool.connect()
  try {
    const result = await client.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'',
    )
    return {
      resources: result.rows.map(row => ({
        uri: new URL(`${row.table_name}/${SCHEMA_PATH}`, resourceBaseUrl).href,
        mimeType: 'application/json',
        name: `"${row.table_name}" database schema`,
      })),
    }
  }
  finally {
    client.release()
  }
})
// postgres://root@localhost:5432/us_states/schema
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const resourceUrl = new URL(request.params.uri)

  const pathComponents = resourceUrl.pathname.split('/')
  const schema = pathComponents.pop()
  const tableName = pathComponents.pop()

  if (schema !== SCHEMA_PATH) {
    throw new Error('Invalid resource URI')
  }

  const client = await pool.connect()
  try {
    const result = await client.query(`
      select t.table_name, t.column_name, t.data_type, f.foreign_table_name, f.foreign_column_name
      from information_schema."columns" t 
      left join (
      SELECT
          tc.table_schema,
          tc.table_name,
          tc.constraint_name,
          kcu.column_name,
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${tableName}'
      ) f on t.table_schema = f.table_schema and t.table_name  = f.table_name and t.column_name = f.column_name
      where t.table_name = '${tableName}'`,
    )

    return {
      contents: [{
        uri: request.params.uri,
        mimeType: 'application/json',
        text: JSON.stringify(result.rows, null, 2),
      }],
    }
  }
  finally {
    client.release()
  }
})
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'query',
    description: 'Run a read-only SQL query',
    inputSchema: {
      type: 'object',
      properties: {
        sql: { type: 'string' },
      },
    },
  }],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'query') {
    const sql = request.params.arguments?.sql as string

    const client = await pool.connect()
    try {
      await client.query('BEGIN TRANSACTION READ ONLY')
      const result = await client.query(sql)
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result.rows, null, 2),
        }],
        isError: false,
      }
    }
    catch (error) {
      console.log('Error:', error)
      throw error
    }
    finally {
      client
        .query('ROLLBACK')
        .catch(error =>
          console.warn('Could not roll back transaction:', error),
        )

      client.release()
    }
  }
  throw new Error(`Unknown tool: ${request.params.name}`)
})

async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

runServer().catch(console.error)
