<template>
  <div class="main-container">
    <div>
      <div v-if="showUserSettingView">
        <div style="display: flex;justify-content: space-between;">
          <div>
            <el-button type="primary" size="small" @click="loadPage(currentPage)">刷新</el-button>
            <el-button type="primary" size="small" @click="showAddUserDialog">添加用户</el-button>
          </div>
          <el-button style="position" type="primary" size="small" @click="showUserSettingView = false" icon="el-icon-close">返回</el-button>
        </div>
        <div style="margin-top: 10px">
          <el-table
            :data="userInfoList"
            v-loading="pageLoading"
            border
            style="width: 100%">
            <el-table-column
              label="用户名">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.userName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="用户管理权限">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.userAdmin ? "有" : "无" }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="APP管理权限">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.appAdmin ? "有" : "无" }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="上次登录时间" width="180px">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.lastActive }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="参与模块">
              <template slot-scope="scope">
                <span style="margin-left: 10px">{{ scope.row.length }}</span>
              </template>
            </el-table-column>
            <el-table-column label="管理" width="250px">
              <template slot-scope="scope">
                <el-button class="margin-right:5px" size="mini" @click="showResetPasswordDialog(scope.row.userId)">重置密码</el-button>
                <el-button class="margin-right:5px" size="mini" @click="showAdminSettingDialog(scope.row)">权限管理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="mid">
          <el-pagination layout="prev, pager, next" :total="pageCount" @current-change="loadPage"/>
        </div>
        <el-dialog title="创建用户" :visible.sync="addUserDialogVisible" center width='500px'>
          <el-form :model="addUserForm" ref="addUserForm" :rules="rules" label-width="120px" v-loading="addUserLoading">
            <el-form-item label="用户名" prop="name">
              <el-input v-model="addUserForm.name"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addUserForm.password"></el-input>
            </el-form-item>
            <el-form-item label="用户管理权限">
              <el-switch v-model="addUserForm.userAdmin" active-text="有" inactive-text="无"/>
            </el-form-item>
            <el-form-item label="APP管理权限">
              <el-switch
                v-model="addUserForm.appAdmin"
                active-text="有"
                inactive-text="无">
              </el-switch>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addUserDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </div>
        </el-dialog>
        <el-dialog title="重设密码" :visible.sync="resetPasswordDialog" center width='500px'>
          <el-form :model="resetPwdForm" ref="resetPwdForm" :rules="restPwdRules" label-width="80px" v-loading="resetPwdLoading">
            <el-form-item label="密码" prop="password">
              <el-input v-model="resetPwdForm.password"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="resetPasswordDialog = false">取 消</el-button>
            <el-button type="primary" @click="resetUserPassword">确 定</el-button>
          </div>
        </el-dialog>
        <el-dialog title="设置管理权限" :visible.sync="adminSetDialogVisible" center width="400px">
          <el-form :model="adminForm" label-width="100px" v-loading="setAdminloading">
            <el-form-item label="用户管理权限">
              <el-switch v-model="adminForm.userAdmin" active-text="有" inactive-text="无"/>
            </el-form-item>
            <el-form-item label="APP管理权限">
              <el-switch v-model="adminForm.appAdmin" active-text="有" inactive-text="无"/>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="adminSetDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="changeAdminSetting">确 定</el-button>
          </div>
        </el-dialog>
      </div>
      <el-form v-else label-width="100px">
        <el-form-item label="用户名">
          <div>{{ userName }}</div>
        </el-form-item>
        <el-form-item label="上次登录时间">
          <div>{{ lastActive }}</div>
        </el-form-item>
        <el-form-item label="用户管理权限">
          <el-button type="primary" size="small" @click="showUserSetting" v-if="userAdmin">管理用户</el-button>
          <div v-else>无</div>
        </el-form-item>
        <el-form-item label="APP管理权限">
          <div>{{ appAdmin ? '有' : '无' }}</div>
        </el-form-item>
        <el-form-item label="负责模块">
          <div class="module-list">
            <div v-for="(moduleName, index) in moduleList" v-bind:key="index">
              <el-button type="info" plain size="mini" style="margin-right: 8px" @click="jumpToModule(moduleName)">{{moduleName}}</el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="logOut">退出登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {LOGIN_MUTATION, LOGOUT_MUTATION} from '../store/mutation-types'
import axios from 'axios'
import md5 from 'md5'
import { mapState } from 'vuex'
export default {
  name: 'user',
  data () {
    return {
      msg: '用户登录',
      visible: false,
      pageCount: 10,
      pageLoading: false,
      currentPage: 1,
      fullscreenLoading: false,
      loading: false,
      loginForm: {
        userName: '',
        password: ''
      },
      addUserLoading: false,
      addUserForm: {
        name: '',
        password: '',
        userAdmin: false,
        appAdmin: false
      },
      adminForm: {
        userAdmin: false,
        appAdmin: false
      },
      resetPwdLoading: false,
      resetPwdForm: {
        password: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ] },
      restPwdRules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      },
      showUserSettingView: false,
      addUserDialogVisible: false,
      setAdminloading: false,
      adminSetDialogVisible: false,
      selectUserId: '',
      resetPasswordDialog: false,
      userInfoList: []
    }
  },
  computed: {
    ...mapState(['login', 'userName', 'lastActive', 'userAdmin', 'appAdmin', 'moduleList'])
  },
  methods: {
    submitForm () {
      this.fullscreenLoading = true
      axios.post('/api/user/logIn', {
        userName: this.loginForm.userName,
        password: md5(this.loginForm.password)
      }).then((response) => {
        this.fullscreenLoading = false
        if (response.data.error) {
          this.$message.error('登录失败， 后台报错 ： ' + response.data.error)
        } else {
          // 登录成功
          this.$store.commit(LOGIN_MUTATION, response.data)
        }
      }).catch((error) => {
        this.$message.error(error.message)
        this.fullscreenLoading = false
      })
    },
    logOut () {
      this.$confirm('确认退出登录 ?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        return axios.post('/api/user/logOut').then(response => {
          if (response.data.error) {
            this.$message.error(response.data.error)
          } else {
            this.$store.commit(LOGOUT_MUTATION)
          }
        }).catch((err) => {
          this.$message({
            type: 'info',
            message: err.message
          })
        })
      }).catch(() => {

      })
    },
    showUserSetting () {
      this.showUserSettingView = true
      this.loadPage(1)
    },
    showAddUserDialog () {
      this.addUserForm = {
        name: '',
        password: '',
        userAdmin: false,
        appAdmin: false
      }
      this.addUserDialogVisible = true
    },
    hideUserSetting () {
      this.showUserSettingView = false
    },
    jumpToModule (moduleName) {

    },
    loadPage (pageNum) {
      this.currentPage = pageNum
      this.pageLoading = true
      // 同时刷新数据。
      axios.get(`/api/user/list?pageNum=${pageNum}`).then(response => {
        if (response.data.error) {
          this.$message.error(response.data.error)
        } else {
          this.pageCount = response.data.pageCount * 10
          this.userInfoList = response.data.usersInfo
        }
        this.pageLoading = false
      }).catch(err => {
        this.$message.error(err.message)
        this.pageLoading = false
      })
    },
    showResetPasswordDialog (userId) {
      this.selectUserId = userId
      this.resetPasswordDialog = true
    },
    resetUserPassword (userId) {
      this.$refs['resetPwdForm'].validate((valid) => {
        if (valid) {
          this.resetPwdLoading = true
          axios.post(`/api/user/resetPassword`, {
            userId: this.selectUserId,
            password: md5(this.resetPwdForm.password)
          }).then(response => {
            if (response.data.error) {
              this.$message.error(response.data.error)
            } else {
              this.$message({
                message: '密码修改成功！',
                type: 'success'
              })
              this.resetPasswordDialog = false
            }
            this.resetPwdLoading = false
          }).catch(err => {
            this.resetPasswordDialog = false
            this.$message.error(err.message)
            this.resetPwdLoading = false
          })
        }
      })
    },
    addUser () {
      this.$refs['addUserForm'].validate((valid) => {
        if (valid) {
          let addUser = Object.assign({}, this.addUserForm)
          addUser.password = md5(addUser.password)
          this.addUserLoading = true
          axios.post(`/api/user/add`, addUser).then(response => {
            if (response.data.error) {
              this.$message.error(response.data.error)
            } else {
              this.$message({
                message: '添加用户成功',
                type: 'success'
              })
              this.addUserDialogVisible = false
              setTimeout(() => {
                this.loadPage(this.currentPage)
              }, 200)
            }
            this.addUserLoading = false
          }).catch(err => {
            this.$message.error(err.message)
            this.addUserLoading = false
          })
        }
      })
    },
    showAdminSettingDialog (userInfo) {
      this.selectUserId = userInfo.userId
      this.adminForm = {
        appAdmin: !!userInfo.appAdmin,
        userAdmin: !!userInfo.userAdmin
      }
      this.adminSetDialogVisible = true
    },
    changeAdminSetting () {
      this.setAdminloading = true
      let form = Object.assign({userId: this.selectUserId}, this.adminForm)
      axios.post('/api/user/setPermission', form).then(response => {
        if (response.data.error) {
          this.$message.error(response.data.error)
        } else {
          this.$message({
            message: '修改权限成功',
            type: 'success'
          })
          this.adminSetDialogVisible = false
          setTimeout(() => {
            this.loadPage(this.currentPage)
          }, 200)
        }
        this.setAdminloading = false
      }).catch(err => {
        this.$message.error(err.message)
        this.setAdminloading = false
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      // 通过 `vm` 访问组件实例
      // 在初始化完成时，先检测本地是否有cookie.
      vm.fullscreenLoading = true
      axios.post('/api/user/check')
        .then((response) => {
          vm.fullscreenLoading = false
          if (response.data.error) {
            vm.$store.commit(LOGOUT_MUTATION)
          } else {
            // 登录成功
            vm.$store.commit(LOGIN_MUTATION, response.data)
          }
        })
        .catch((error) => {
          this.$message.error(error.message)
          vm.fullscreenLoading = false
        })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-container {
  height: 100%;
  width: 100%;
}
.mid {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.module-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
</style>
