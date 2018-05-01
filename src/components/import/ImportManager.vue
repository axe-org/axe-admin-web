<template>
  <div class="container" v-loading="loading">
    <div class="option">
      <el-select v-model="selectedAppVersion">
        <el-option-group v-for="group in optionList" :key="group.label" :label="group.label">
          <el-option v-for="option in group.options" :key="option.value" :value="option.value" :label="option.label"/>
        </el-option-group>
      </el-select>
      <div class="option-right">
        <el-button type="primary" icon="el-icon-refresh" @click="refresh">刷新</el-button>
        <el-dialog title="模块接入" :visible.sync="buildDialogVisible" center width="500"
        :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" v-loading="submitBuildLoading">
          <el-form label-width="120" style="width:450px;" size="small">
            <el-form-item label="接入APP版本">
              <div>{{ selectedAppVersion }}</div>
            </el-form-item>
            <el-form-item label="接入内容 ">
              <div v-for="module in selection" :key="module.name">{{ module.module + ' : ' + module.moduleVersion }}</div>
            </el-form-item>
            <el-form-item label="jenkins地址">
              <a href="http://jenkins.luoxianming.cn/job/DemoModuleImport/" target="_blank">TODO跳转</a>
            </el-form-item>
            <el-form-item v-if="startBuilding" label="构建日志">
              <a href="http://jenkins.luoxianming.cn/job/DemoModuleImport/" target="_blank">TODO跳转</a>
            </el-form-item>
            <el-form-item v-if="startBuilding" label="构建状态">
              <div>{{buildStatusText}}</div>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button v-if="!jenkinsBuilding" @click="buildDialogVisible = false">{{startBuilding ? '关闭' : '取消'}}</el-button>
            <el-button v-if="!buildFinished" type="danger" :loading="jenkinsBuilding" @click="buildAction">接入</el-button>
          </div>
        </el-dialog>
        <el-button v-if="canImport" type="primary" icon="el-icon-check" @click="showImportDialog">接入模块</el-button>
      </div>
    </div>
    <el-table :data="importList" border class="table" @selection-change="handleSelection">
      <el-table-column type="selection" width="55"/>
      <el-table-column label="APP版本" prop="appVersion"/>
      <el-table-column label="模块" prop="module"/>
      <el-table-column label="提起人" prop="applicant"/>
      <el-table-column label="提起时间" prop="applyTime"/>
      <el-table-column label="备注说明" prop="note"/>
      <el-table-column label="新版本号">
        <template slot-scope="scope">
          <router-link :to="`/module/${scope.row.moduleId}/version/${scope.row.moduleVersion}`">{{ scope.row.moduleVersion }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="当前状态" prop="status"/>
    </el-table>
  </div>
</template>
<script>
import axios from 'axios'
import conf from '../../conf'
export default {
  name: 'ImportManager',
  data () {
    return {
      optionList: [],
      selectedAppVersion: '',
      loading: false,
      importList: [],
      selection: [],
      submitBuildLoading: false,
      buildDialogVisible: false,
      startBuilding: false,
      buildFinished: false,
      buildStatusText: '',
      buildInfo: {
        buildNumber: '',
        buildId: '',
        status: ''
      }
    }
  },
  computed: {
    canImport () {
      return this.$store.state.appAdmin && this.selection.length
    },
    appAdmin () {
      return this.$store.state.appAdmin
    },
    jenkinsBuilding () {
      return this.buildInfo.status === conf.JENKINS_JOB_BUILD_STATUS_BUILDING
    }
  },
  methods: {
    refresh () {
      this.loading = true
      this.selection = []
      // 获取进行中app版本号
      axios.get('/api/app/ongoing').then(res => {
        if (res.data.error) {
          if (this.selectedAppVersion === '') {
            this.loading = false
          }
          return this.$message({
            showClose: true,
            message: res.data.error,
            type: 'error',
            duration: 0
          })
        }
        // 处理版本。
        let options = []
        let unStartVersions = []
        let startedVersions = []
        res.data.versionList.forEach(version => {
          if (version.status === conf.TIMELINE_STATUS_WAITING) {
            unStartVersions.push({
              label: version.version,
              value: version.version
            })
          } else {
            startedVersions.push({
              label: version.version,
              value: version.version
            })
          }
        })
        if (unStartVersions.length === 0 && startedVersions.length === 0) {
          return this.$message({
            showClose: true,
            message: '请先添加APP版本， 才能进行模块接入管理！！！',
            type: 'error',
            duration: 0
          })
        }
        let selectVersion = ''
        if (unStartVersions.length) {
          options.push({
            label: '未开始',
            options: unStartVersions
          })
          selectVersion = unStartVersions[0].value
        }
        if (startedVersions.length) {
          options.push({
            label: '进行中',
            options: startedVersions
          })
          selectVersion = startedVersions[0].value
        }
        this.optionList = options
        if (this.selectedAppVersion === '') {
          this.selectedAppVersion = selectVersion
          this.loadImportList()
        }
      }).catch(err => {
        if (this.selectedAppVersion === '') {
          this.loading = false
        }
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
      })
      if (this.selectedAppVersion !== '') {
        this.loadImportList()
      }
    },
    loadImportList () {
      axios.get(`/api/import/waiting?appVersion=${this.selectedAppVersion}`).then(res => {
        this.loading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            duration: 0,
            type: 'error',
            message: res.data.error
          })
        }
        this.importList = res.data
      }).catch(err => {
        this.loading = false
        this.$message({
          showClose: true,
          duration: 0,
          type: 'error',
          message: err.message
        })
      })
    },
    handleSelection (val) {
      this.selection = val
    },
    showImportDialog () {
      this.loading = true
      this.startBuilding = false
      this.buildFinished = false
      // 检查jenkins构建状态
      axios.get('/api/jenkins/import/status').then(res => {
        this.loading = false
        if (res.data.error) {
          return this.$alert('检查jenkins状态出错， 报错内容 : \n' + res.data.error + '\n 请稍后重试！！！')
        }
        if (res.data.jobFree) {
          // 则可以构建
          this.buildDialogVisible = true
        } else {
          this.$alert('当前 Jenkins Job 正在构建中， 请检测jenkins状态，确认空闲后重试！！！')
        }
      }).catch(err => {
        this.$alert('检查jenkins状态出错， 报错内容 : \n' + err.message + '\n 请稍后重试！！！')
      })
    },
    buildAction () {
      if (this.jenkinsBuilding) {
        return
      }
      this.submitBuildLoading = true
      let importList = []
      this.selection.forEach(select => {
        importList.push({
          importId: select.importId,
          name: select.module,
          version: select.moduleVersion
        })
      })
      axios.post('/api/jenkins/import/build', {
        appVersion: this.selectedAppVersion,
        importList: importList
      }).then(res => {
        this.submitBuildLoading = false
        if (res.data.error) {
          return this.$alert('jenkins 任务构建失败， 报错内容 : \n' + res.data.error + '\n 请稍后重试！！！')
        }
        // 构建调用成功.
        this.buildInfo = res.data
        let startTime = new Date(this.buildInfo.startedTime)
        let estimatedDuration = parseInt(this.buildInfo.estimatedDuration / 60 / 1000)
        this.buildStatusText = `构建中，开始于${startTime.getHours()}:${startTime.getMinutes()} , 预计耗时 ${estimatedDuration} 分钟。`
        this.startBuilding = true
        // 然后监控构建状态
        this.watchJenkinsBuild()
      }).catch(err => {
        this.submitBuildLoading = false
        this.$alert('构建jenkins任务时，发生异常， 报错内容 : \n' + err.message + '\n 请稍后重试！！！')
      })
    },
    watchJenkinsBuild () {
      axios.get(`/api/jenkins/build?buildId=${this.buildInfo.buildId}`).then(res => {
        if (res.data.error) {
          this.buildInfo.status = conf.JENKINS_JOB_BUILD_STATUS_FAILURE
          this.buildStatusText = '构建失败 ！！！'
          this.buildFinished = true
          return this.$alert('检测jenkins构建状态时出现未知异常， 报错内容 : \n' + res.data.error + '\n 请检查出错原因！！！')
        }
        let status = res.data.status
        if (status === conf.JENKINS_JOB_BUILD_STATUS_BUILDING) {
          // 构建过程中， 设置5秒时间后继续查询
          setTimeout(() => {
            this.watchJenkinsBuild()
          }, 3000)
        } else {
          // 表示结束
          this.buildInfo = res.data
          this.buildFinished = true
          console.log(res.data)
          if (status === conf.JENKINS_JOB_BUILD_STATUS_SUCCESS) {
            this.buildStatusText = '构建成功 ！！！'
            this.$message({
              type: 'success',
              message: '构建成功 ！！！'
            })
          } else {
            this.buildStatusText = `构建失败， 当前状态${status} , 请检测Jenkins构建情况！！`
          }
        }
      }).catch(err => {
        this.buildFinished = true
        this.buildInfo.status = conf.JENKINS_JOB_BUILD_STATUS_FAILURE
        this.buildStatusText = '构建失败 ，发生网络异常 ！！！'
        this.$alert('检测jenkins构建状态时出现未知异常， 报错内容 : \n' + err.message + '\n 请检查出错原因！！！')
      })
    }
  },
  mounted () {
    this.refresh()
  }
}
</script>
<style scoped>
.container{
  width: 100%;
  height: 100%;
}
.option {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 50px;
  justify-content: space-between
}
.table {
  margin-top: 15px;
}
</style>
