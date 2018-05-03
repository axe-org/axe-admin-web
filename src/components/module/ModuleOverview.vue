<template>
  <div class="container">
    <div class="left hmid" v-loading="moduleInfoLoading">
      <el-form label-width="120px" style="width:100%; align-self:flex-start;">
        <el-form-item label="模块名">
          <div>{{ moduleInfo.name }}</div>
        </el-form-item>
        <el-form-item label="类型" style="margin-top: -17px;">
          <div>{{ moduleInfo.type }}</div>
        </el-form-item>
        <el-form-item label="负责人" style="margin-top: -17px;">
          <div>{{ moduleInfo.userList.join(' , ') }}</div>
        </el-form-item>
        <el-form-item label="Jenkins任务" style="margin-top: -17px;">
          <a :href="jenkinsURL" target="_blank">{{ moduleInfo.jenkinsJob }}</a>
        </el-form-item>
        <el-form-item label="仓库地址" style="margin-top: -17px;">
          <a :href="moduleInfo.homeURL" target="_blank">{{  moduleInfo.homeURL }}</a>
        </el-form-item>
        <el-form-item label="仓库类型" style="margin-top: -17px;">
          <div>{{ moduleInfo.gitType }}</div>
        </el-form-item>
        <el-form-item label="版本数量" style="margin-top: -17px;">
          <div>{{ moduleInfo.versionCount }}</div>
        </el-form-item>
        <el-form-item label="最新发布版本" style="margin-top: -17px;">
          <div>{{ moduleInfo.maxPrdVersion }}</div>
        </el-form-item>
        <el-form-item label="开发中版本" style="margin-top: -17px;">
          <div>{{ moduleInfo.onGoingList.join(' , ') }}</div>
        </el-form-item>
      </el-form>
      <el-dialog title="用户管理" :visible.sync="moduleAdminDialogVisible" center width="550px" v-loading="moduleAdminLoading">
        <el-transfer :titles="['所有用户','模块管理员']" filterable v-model="adminUsers" :data="allUsers"/>
        <div slot="footer" class="dialog-footer">
          <el-button @click="moduleAdminDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAdminChange">确 定</el-button>
        </div>
      </el-dialog>
      <el-button style="margin-top: 20px;" type="primary" v-if="moduleAdmin" @click="showAdminManagerDialog">用户管理</el-button>
      <br>
      <new-version-form v-if="moduleAdmin" :module-id="$route.params.moduleId" @success="addVersionSuccess"/>
    </div>
    <div class="right" v-loading="moduleVersionsLoading">
      <el-table :data="versionList" border class="">
        <el-table-column label="版本号" align="center">
          <template slot-scope="scope">
            <el-button size="small" @click="$router.push(`/module/${$route.params.moduleId}/version/${scope.row.version}`)" plain type="primary">
              {{ scope.row.version }}
            </el-button>
        </template>
        </el-table-column>
        <el-table-column label="当前状态" prop="statusInfo" align="center"/>
        <el-table-column label="APP版本" prop="appVersion" align="center">
          <template slot-scope="scope">
            <el-button size="small" @click="$router.push('/app-version/' + scope.row.appVersion)" plain>
              {{ scope.row.appVersion }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="查看详情" align="center">
          <template slot-scope="scope">
            <el-button size="small" @click="openModuleVersion(scope.row.version)" plain type="warning">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="hmid">
        <el-pagination layout="prev, pager, next" :page-count="pageCount" :current-page.sync="pageNum" @current-change="loadModuleVersions"/>
      </div>
    </div>
  </div>
</template>
<script>
import NewVersionForm from './NewVersionForm'
import axios from 'axios'
import config from '../../conf/config'
import conf from '../../conf'
export default {
  name: 'ModuleOverview',
  components: {
    'new-version-form': NewVersionForm
  },
  data () {
    return {
      moduleInfo: {
        name: '',
        type: '',
        userList: [],
        jenkinsJob: '',
        homeURL: '',
        versionCount: 0,
        maxPrdVersion: '',
        onGoingList: []
      },
      allUsers: [],
      adminUsers: [],
      originAdminUsers: [],
      moduleInfoLoading: false,
      moduleVersionsLoading: false,
      moduleAdminDialogVisible: false,
      moduleAdminLoading: false,
      versionList: [],
      pageCount: 1,
      pageNum: 1
    }
  },
  computed: {
    jenkinsURL () {
      return config.jenkinsURL + '/job/' + this.moduleInfo.jenkinsJob
    },
    moduleAdmin () {
      if (config.guestMode && this.$store.state.userId === -1) {
        return true
      }
      return this.$store.state.moduleIdList.includes(parseInt(this.$route.params.moduleId))
    }
  },
  methods: {
    openModuleVersion (version) {
      window.open(`/#/module/${this.$route.params.moduleId}/version/${version}`)
    },
    loadModuleInfo () {
      this.moduleInfoLoading = true
      axios.get(`/api/module/info?moduleId=${this.$route.params.moduleId}`).then(res => {
        this.moduleInfoLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            message: res.data.error,
            type: 'error',
            duration: 0
          })
        }
        document.title = res.data.name
        this.moduleInfo = res.data
      }).catch(err => {
        this.moduleInfoLoading = false
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
      })
    },
    addVersionSuccess () {
      this.pageNum = 1
      this.pageCount = 1
      this.loadModuleVersions()
    },
    loadModuleVersions (pageNum) {
      this.moduleVersionsLoading = true
      axios.post('/api/module/version/list', {
        moduleId: this.$route.params.moduleId,
        pageNum: this.pageNum
      }).then(res => {
        this.moduleVersionsLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            message: res.data.error,
            type: 'error',
            duration: 0
          })
        }
        res.data.versionList.forEach(version => {
          let statusInfo = '未开始'
          if (version.status === conf.TIMELINE_STATUS_DOING) {
            if (version.released) {
              statusInfo = '已发布版本'
            } else if (version.imported) {
              statusInfo = '已接入APP'
            } else {
              statusInfo = '开发中'
            }
          } else if (version.status === conf.TIMELINE_STATUS_DONE) {
            statusInfo = '已完成'
          }
          version['statusInfo'] = statusInfo
        })
        this.versionList = res.data.versionList
        this.pageCount = res.data.pageCount
      }).catch(err => {
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
      })
    },
    submitAdminChange () {
      // 提交前检测， 模块不能没有管理员。
      if (this.adminUsers.length === 0) {
        return this.$alert('模块必须要有至少一个管理员！！！')
      }
      if (this.adminUsers.length > 100) {
        return this.$alert('模块管理员数量不能超过100')
      }
      let added = []
      let deleted = []
      this.adminUsers.forEach(userId => {
        if (!this.originAdminUsers.includes(userId)) {
          added.push(userId)
        }
      })
      this.originAdminUsers.forEach(userId => {
        if (!this.adminUsers.includes(userId)) {
          deleted.push(userId)
        }
      })
      if (added.length === 0 && deleted.length === 0) {
        return this.$alert('请变更模块管理员权限！！！')
      }
      this.moduleAdminLoading = true
      axios.post('/api/module/admin/change', {
        moduleId: this.$route.params.moduleId,
        deleted: deleted,
        added: added
      }).then((res) => {
        this.moduleAdminLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            message: res.data.error,
            type: 'error',
            duration: 0
          })
        }
        this.$message({
          message: '模块管理员权限变更成功！！！',
          type: 'success'
        })
        this.moduleAdminDialogVisible = false
        this.loadModuleInfo()
      }).catch(err => {
        this.moduleAdminLoading = false
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
      })
    },
    showAdminManagerDialog () {
      this.moduleAdminDialogVisible = true
      this.moduleAdminLoading = true
      axios.get(`/api/module/admin/list?moduleId=${this.$route.params.moduleId}`).then(res => {
        this.moduleAdminLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            message: res.data.error,
            type: 'error',
            duration: 0
          })
        }
        let allUsers = []
        let adminUsers = []
        let self = this.$store.state.userName
        res.data.adminUsers.forEach(user => {
          allUsers.push({
            key: user.userId,
            label: user.userName,
            disabled: user.userName === self
          })
          adminUsers.push(user.userId)
        })
        res.data.otherUsers.forEach(user => {
          allUsers.push({
            key: user.userId,
            label: user.userName
          })
        })
        this.allUsers = allUsers
        this.adminUsers = adminUsers
        this.originAdminUsers = [...adminUsers]
      }).catch(err => {
        this.moduleAdminLoading = false
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.loadModuleInfo()
      vm.pageNum = 1
      vm.loadModuleVersions(1)
    })
  },
  beforeRouteUpdate (to, from, next) {
    next()
    this.loadModuleInfo()
    this.pageNum = 1
    this.loadModuleVersions(1)
  }

}
</script>
<style scoped>
.container {
  width: 100%;
  min-width: 600px;
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.left {
  min-width: 300px;
  max-width: 450px;
  height: 100%;
}
.right {
  min-width: 450px;
  max-width: 550px;
  height: 100%;
  margin-right: 12vh;
}
</style>
