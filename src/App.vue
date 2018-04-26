<template>
  <el-container style="height: 100%;">
    <el-aside style="height: 100%;" width="180px">
      <el-menu :default-active="activeRoute" style="height: 100%;" background-color="#545c64" :router="true" text-color="#fff" active-text-color="#ffd04b">
        <el-menu-item index="/app">
          <i class="el-icon-menu"></i>
          <span slot="title">APP</span>
        </el-menu-item>
        <el-menu-item index="/modulelist">
          <i class="el-icon-menu"></i>
          <span slot="title">模块列表</span>
        </el-menu-item>
        <el-menu-item index="/module-manager">
          <i class="el-icon-menu"></i>
          <span slot="title">接入管理</span>
        </el-menu-item>
        <el-menu-item index="/hello5">
          <i class="el-icon-menu"></i>
          <span slot="title">动态路由</span>
        </el-menu-item>
        <el-menu-item index="/offpack">
          <i class="el-icon-menu"></i>
          <span slot="title">离线包</span>
        </el-menu-item>
        <el-menu-item index="/help">
          <i class="el-icon-menu"></i>
          <span slot="title">说明与文档</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <i class="el-icon-menu"></i>
          <span slot="title">用户信息</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <keep-alive v-if="login">
        <router-view/>
      </keep-alive>
    </el-main>
    <div v-if="!login" class="top-float">
      <el-form :model="loginForm" status-icon ref="loginForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.userName"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="loginForm.password" auto-complete="on"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="logIn" v-loading.fullscreen.lock="fullscreenLoading">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'
import {LOGIN_MUTATION, LOGOUT_MUTATION} from './store/mutation-types'
import md5 from 'md5'
import axios from 'axios'
export default {
  data () {
    return {
      activeRoute: '/user',
      fullscreenLoading: false,
      loginForm: {
        userName: '',
        password: ''
      }
    }
  },
  computed: {
    ...mapState(['login'])
  },
  name: 'App',
  methods: {
    logIn () {
      this.fullscreenLoading = true
      axios.post('/api/user/logIn', {
        userName: this.loginForm.userName,
        password: md5(this.loginForm.password)
      }).then((response) => {
        this.fullscreenLoading = false
        if (response.data.error) {
          console.log(response.data.error)
          this.$store.commit(LOGOUT_MUTATION)
          this.$message.error('登录失败， 后台报错 ： ' + response.data.error)
        } else {
          // 登录成功
          this.$store.commit(LOGIN_MUTATION, response.data)
        }
      }).catch((error) => {
        console.log(error.message)
        this.fullscreenLoading = false
      })
    }
  },
  mounted () {
    // 设置路由记录， 以切换导航时，记录原有页面内容。
    let routeRecords = {}
    this.$router.beforeEach((to, from, next) => {
      if (to.meta && to.meta.title) {
        document.title = to.meta.title
      }
      let split = to.fullPath.split('/')
      if (split.length < 2) {
        return next()
      }
      let root = split[1]
      // 设置当前选中的菜单。 这个ele菜单好难受啊。
      this.activeRoute = '/' + root
      if (split.length === 2) {
        next(routeRecords[root])
      } else {
        routeRecords[root] = to.fullPath
        next()
      }
    })
    // 检测登录
    this.fullscreenLoading = true
    axios.post('/api/user/check').then((response) => {
      this.fullscreenLoading = false
      if (response.data.error) {
        console.log(response.data)
        this.$store.commit(LOGOUT_MUTATION)
      } else {
        // 登录成功
        this.$store.commit(LOGIN_MUTATION, response.data)
      }
    }).catch((error) => {
      console.log(error.message)
      this.fullscreenLoading = false
    })
    if (this.$route.fullPath === '/') {
      this.$router.replace('/user')
    }
  }
}

</script>

<style>
  @import './assets/common.css';
  body {
    height: 100%;
    padding:0;
    margin:0;
  }
  html {
    height: 100%;
  }
  .main-container {
    width: 100%;
    height: 100%;
  }
  .top-float {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
