import Vuex from 'vuex'
import Vue from 'vue'
import * as TYPES from './mutation-types'
import config from '../conf/config'

Vue.use(Vuex)

let initialState = {
  login: false,
  userId: '',
  userName: '',
  lastActive: '',
  userAdmin: false,
  appAdmin: false,
  moduleList: [],
  moduleIdList: []
}
if (config.guestMode) {
  initialState = {
    login: true,
    userId: -1,
    userName: 'guest',
    lastActive: new Date(),
    userAdmin: true,
    appAdmin: true,
    moduleList: [],
    moduleIdList: []
  }
}

const store = new Vuex.Store({
  state: initialState,
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
