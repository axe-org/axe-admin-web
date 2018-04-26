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
    moduleList: [],
    moduleIdList: []
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
      let idlist = []
      payload.moduleList.forEach(module => {
        idlist.push(module.id)
      })
      state.moduleIdList = idlist
      console.log('hello ,', payload.userName)
    },
    [TYPES.LOGOUT_MUTATION] (state) {
      state.login = false
      state.userId = ''
      state.userName = ''
      state.userAdmin = false
      state.appAdmin = false
      state.moduleIdList = []
      state.moduleList = []
    }
  }
})
export default store
