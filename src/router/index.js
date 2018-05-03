import Vue from 'vue'
import Router from 'vue-router'
import User from '@/components/User'
import OfflinePackage from '@/components/OfflinePackage'
import Help from '@/components/help/Help'

import App from '@/components/app/App'
import config from '../conf/config'

import ModuleList from '@/components/module/ModuleList'
import ModuleOverview from '@/components/module/ModuleOverview'
import ModuleDetail from '@/components/module/ModuleDetail'

import ModuleImport from '@/components/import/ModuleImport'

import DynamicRouter from '@/components/DynamicRouter'

Vue.use(Router)

let router = new Router({
  routes: [
    { path: '/user', component: User, meta: { title: '用户信息' } },
    { path: '/offpack', component: OfflinePackage, meta: { title: '离线包管理' } },
    { path: '/dynamic-router', component: DynamicRouter, meta: {title: '动态路由管理'} },
    { path: '/help', component: Help, meta: {title: '帮助文档'} },
    { path: '/app', component: App, meta: {title: config.appName} },
    { path: '/app-version/:version',
      redirect: to => {
        let appRoute = router.match('/app')
        appRoute.query['version'] = to.params['version']
        return appRoute
      }},
    { path: '/import', component: ModuleImport, meta: {title: '接入管理'} },
    { path: '/modulelist', component: ModuleList, meta: { title: '模块列表' } },
    { path: '/module-overview/:moduleId', component: ModuleOverview, meta: {title: '模块概览'} },
    { path: '/module/:moduleId/version/:version', component: ModuleDetail, meta: {title: '模块版本详情', keepFresh: true} }
  ]
})
export default router
