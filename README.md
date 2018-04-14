# axe-admin-web
axe-admin static web


# axe-admin

admin server for axe

使用 `Vue` 开发的`axe`管理平台 ，即一个 业务组件开发管理平台。

## 目前进度

20%。。。


## 计划使用技术栈

用docker 来进行安装配置， 以适配 mysql 。

## 后端

nodejs, express , 数据库用啥。。。

## 前端

vue , less ,webpack, vuex , vue-router

eslint , babel

异步回调使用 async ，不使用 promise

请求使用 axios

## 使用 express

反向代理， 解决 离线包系统的安全性问题。

## 权限设计

* 用户管理员 最高等级管理员，进行用户的管理，增删改。
* app管理员， app管理组的， 负责审核 管理模块的接入。
* 模块管理员， 负责一个单独模块的管理， 大部分人是这个身份。

模块管理员可以管理模块



## TODO

整个APP的架构图绘制。 这个是比较重要的，还是考虑在内， 但是需要考虑版本问题。


## 整体管理平台结构

docker 管理安装

分为多个部分 ：

1. 管理的静态网页
2. 管理的服务端
3. docker管理配置部分， 包括nginx的配置和多项配置和服务的开启。
4. 离线包 测试环境
5. 动态路由 测试环境
6. jenkins 链接


#### 平台配置内容

平台的所有模块都有自己的配置项，但是最终全部汇总到 一份配置中， 也就是docker使用的配置， 由docker构建时进行发放

拥有配置项如下 ：

* APP名称 ： DemoAPP
* git仓库地址 
* 管理平台host
* port : 默认80
* 离线包 生产环境URL 本地情况下， 测试环境与生存环境相同。
* 离线包测试环境 host  // 或者可以不使用 host形式，而使用 subpath形式。 // 则 subpath形式是固定地址的。
* 动态路由 生存环境URL
* 动态路由测试环境 host
* adminUserName: 'admin', // 管理员用户只有一个，建议手动设置后，再使用。这个帐号只进行用户的管理。
* adminPassword: 'asdfgh', // 默认提供一个最高权限的管理员用户， 可以管理其他所有用户，且进行用户创建
* sqlType: 'sqlite', // 只有两种类型 sqlite和 mysql ，暂时只实现 sqlite
* offlineAppId: 'xxapp', // 离线包使用的APPID

