import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import User from '@/components/User'
import OfflinePackage from '@/components/OfflinePackage'
import Help from '@/components/help/Help'

import App from '@/components/app/App'
import AppDetail from '@/components/app/AppDetail'
import AppForm from '@/components/app/AppForm'

import Timeline from '@/components/timeline/Overview'
import AppTimeline from '@/components/timeline/App'

import ModuleList from '@/components/module/ModuleList'
import ModuleOverview from '@/components/module/ModuleOverview'
import ModuleDetail from '@/components/module/ModuleDetail'

import ModuleImport from '@/components/import/ModuleImport'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/hello',
      component: HelloWorld,
      meta: { title: '首页入口' }
    }, {
      path: '/user',
      component: User,
      meta: { title: '用户信息' }
    }, {
      path: '/offpack',
      component: OfflinePackage,
      meta: { title: '离线包管理' }
    },
    { path: '/help', component: Help, meta: {title: '帮助文档'} },
    {
      path: '/app',
      component: App,
      children: [
        { path: 'new', component: AppForm, meta: { title: '创建新版本' } },
        { path: 'version/:version', component: AppDetail }
      ]
    },
    { path: '/apptimeline/:lineId', component: AppTimeline },
    { path: '/timeline', component: Timeline },
    {path: '/import', component: ModuleImport, meta: {title: '接入管理'}},
    { path: '/modulelist', component: ModuleList, meta: { title: '模块列表' } },
    {path: '/module-overview/:moduleId', component: ModuleOverview, meta: {title: '模块概览'}},
    {path: '/module/:moduleId/version/:version', component: ModuleDetail, meta: {title: '模块版本详情', keepFresh: true}}
  ]
})
