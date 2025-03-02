/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const MonitorController = () => import('#controllers/monitors_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/up-time', [MonitorController, 'check'])
router.get('/monitors', [MonitorController, 'insert'])
