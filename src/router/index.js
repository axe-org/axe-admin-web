import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import User from '@/components/User'
import OfflinePackage from '@/components/OfflinePackage'
import Help from '@/components/help/Help'
import IndexHelp from '@/components/help/Index'
import AppHelp from '@/components/help/App'

import App from '@/components/app/App'
import AppDetail from '@/components/app/AppDetail'
import AppForm from '@/components/app/AppForm'

import Timeline from '@/components/timeline/Overview'
import AppTimeline from '@/components/timeline/App'

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
    { path: '/help',
      component: Help,
      children: [
        { path: 'index', component: IndexHelp, meta: { title: '帮助首页' } },
        { path: 'app', component: AppHelp, meta: { title: '帮助' } }
      ]
    },
    {
      path: '/app',
      component: App,
      children: [
        { path: 'help', component: AppHelp, meta: { title: 'APP帮助' } },
        { path: 'new', component: AppForm, meta: { title: '创建新版本' } },
        { path: 'version/:version', component: AppDetail }
      ]
    },
    { path: '/apptimeline/:lineId', component: AppTimeline },
    {
      path: '/timeline',
      component: Timeline
    }
  ]
})
