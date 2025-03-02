import type { HttpContext } from '@adonisjs/core/http'
import ClickHouseService from '#services/click_house_service'

export default class MonitorsController {
  async check({}: HttpContext) {
    const clickHouseService = new ClickHouseService()
    const result = await clickHouseService.query('SELECT * FROM monitors')
    return {
      status: 'ok',
      result,
    }
  }
  async insert({}: HttpContext) {
    const clickHouseService = new ClickHouseService()
    const exampleData = [
      {
        id: 1,
        name: 'Example Monitor',
        url: 'https://example.com',
        frequency: 5,
        is_active: 1,
        created_at: new Date().toISOString(),
        user_id: 1,
      },
    ]
    const result = await clickHouseService.insert('monitors', exampleData)
    return {
      status: 'ok',
      result,
    }
  }
}
