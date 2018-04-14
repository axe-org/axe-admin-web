import Vuex from 'vuex'
import Vue from 'vue'
import * as TYPES from './mutation-types'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    login: false,
    userId: '',
    userName: '',
    lastActive: '',
    userAdmin: false,
    appAdmin: false,
    moduleList: []
  },
  mutations: {
    [TYPES.LOGIN_MUTATION] (state, payload) {
      state.login = true
      state.userName = payload.userName
      state.lastActive = payload.lastActive
      state.userAdmin = payload.userAdmin
      state.userId = payload.userId
      state.appAdmin = payload.appAdmin
      state.moduleList = payload.moduleList
      console.log('hello ,', payload.userName)
    },
    [TYPES.LOGOUT_MUTATION] (state) {
      state.login = false
      state.userId = ''
      state.userName = ''
      state.userAdmin = false
      state.appAdmin = false
    }
  }
})
export default store
