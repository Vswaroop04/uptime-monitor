import { createClient } from '@clickhouse/client'
import env from '#start/env'

export default class ClickHouseService {
  private client

  constructor() {
    this.client = createClient({
      url: env.get('CLICKHOUSE_HOST'),
      username: env.get('CLICKHOUSE_USERNAME'),
      password: env.get('CLICKHOUSE_PASSWORD'),
    })
    this.createUsersTable()
    this.createMonitorsTable()
    this.createMonitorStatusesTable()
  }

  async query(sql: string) {
    const rows = await this.client.query({
      query: sql,
      format: 'JSON',
    })
    return rows.json()
  }

  async insert(table: string, data: any[]) {
    return this.client.insert({
      table,
      values: data,
      format: 'JSONEachRow',
    })
  }

  async createUsersTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id UInt32,
        username String,
        password String
      ) ENGINE = MergeTree()
      ORDER BY id;
    `
    return this.query(sql)
  }

  async createMonitorsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS monitors (
        id UInt32,
        name String,
        url String,
        frequency UInt32,
        is_active UInt8 DEFAULT 1,
        created_at DateTime DEFAULT now(),
        user_id UInt32
      ) ENGINE = MergeTree()
      ORDER BY id;
    `
    return this.query(sql)
  }

  async createMonitorStatusesTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS monitor_statuses (
        id UInt32,
        monitor_id UInt32,
        is_up UInt8,
        response_time UInt32,
        timestamp DateTime DEFAULT now()
      ) ENGINE = MergeTree()
      ORDER BY id;
    `
    return this.query(sql)
  }
}
