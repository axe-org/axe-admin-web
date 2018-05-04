import axios from 'axios'
import { Message } from 'element-ui'

// 配置内容从后台获取， 但是如果失败，则展示默认内容， 可以手动打包以确保准确性
let config = {
  appName: 'Demo', // APP名称， 展示使用
  appGitHome: 'https://github.com/axe-org/demo-app', // 仓库地址
  dynamicRouterAdminURL: 'https://dynamic.demo.axe-org.cn/admin/', // 生产环境的动态路由管理页面地址
  devDynamicRouterAdminURL: 'http://localhost:2679/admin/', // 测试环境的页面地址。需要注意这个测试环境地址。
  // 默认情况下axe构建是供本地测试使用的, 所以这里的地址是默认的地址， localhost + 端口号。 但是真正使用时，如果要在外部设置一层反向代理时，需要设定这里最终的对外URL.
  offlinePackAdminURL: 'https://offline.demo.axe-org.cn/admin/', // 离线包的管理页面地址，同上
  devOfflinePackAdminURL: 'http://localhost:2677/admin/',
  jenkinsURL: 'http://jenkins.luoxianming.cn', // jenkins服务器地址
  jenkinsModuleImportJobName: 'DemoModuleImport' // jenkins接入模块的job名。
}
// 访客模式， 不读配置， 固定写死。 发布的版本分为正常版本和访客版本。
config['guestMode'] = false

let ipRegex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

axios.get('/api/config').then(res => {
  Object.assign(config, res.data)
  // 从后台刷新时， 根据host来重新设定AdminURL
  if (config.dynamicRouterHost === 'localhost' || ipRegex.test(config.dynamicRouterHost)) {
    config.dynamicRouterAdminURL = `http://${config.dynamicRouterHost}:2669/admin/`
  } else {
    config.dynamicRouterAdminURL = `http://${config.dynamicRouterHost}/admin/`
  }

  if (config.devDynamicRouterHost === 'localhost' || ipRegex.test(config.devDynamicRouterHost)) {
    config.devDynamicRouterAdminURL = `http://${config.devDynamicRouterHost}:2679/admin/`
  } else {
    config.devDynamicRouterAdminURL = `http://${config.devDynamicRouterHost}/admin/`
  }

  if (config.offlinePackHost === 'localhost' || ipRegex.test(config.offlinePackHost)) {
    config.offlinePackAdminURL = `http://${config.offlinePackHost}:2667/admin/`
  } else {
    config.offlinePackAdminURL = `http://${config.offlinePackHost}/admin/`
  }

  if (config.devOfflinePackHost === 'localhost' || ipRegex.test(config.devOfflinePackHost)) {
    config.devOfflinePackAdminURL = `http://${config.devOfflinePackHost}:2677/admin/`
  } else {
    config.devOfflinePackAdminURL = `http://${config.devOfflinePackHost}/admin/`
  }
}).catch(err => {
  Message({
    duration: 0,
    showClose: true,
    type: 'error',
    message: ' 初始化配置内容失败 ： ' + err.message
  })
})

export default config
