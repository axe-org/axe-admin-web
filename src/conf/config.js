// 配置内容从后台获取， 但是如果失败，则展示默认内容， 可以手动打包以确保准确性
let defaultConfig = {
  appName: 'Demo', // APP名称， 展示使用
  guestMode: false,
  appGitHome: 'https://github.com/axe-org/demo-app', // 仓库地址
  dynamicRouterAdminURL: 'https://proxy-dynamic.demo.axe-org.cn/admin/', // 生产环境的动态路由管理页面地址
  devDynamicRouterAdminURL: 'http://localhost:2679/admin/', // 测试环境的页面地址。需要注意这个测试环境地址。
  // 默认情况下axe构建是供本地测试使用的, 所以这里的地址是默认的地址， localhost + 端口号。 但是真正使用时，如果要在外部设置一层反向代理时，需要设定这里最终的对外URL.
  offlinePackAdminURL: 'https://proxy-offline.demo.axe-org.cn/admin/', // 离线包的管理页面地址，同上
  devOfflinePackAdminURL: 'http://localhost:2677/admin/',
  jenkinsURL: 'http://jenkins.luoxianming.cn', // jenkins服务器地址
  jenkinsModuleImportJobName: 'DemoModuleImport' // jenkins接入模块的job名。
}
// 加载配置文件。
let config = window.AXEWebConfig ? window.AXEWebConfig : defaultConfig

export default config
