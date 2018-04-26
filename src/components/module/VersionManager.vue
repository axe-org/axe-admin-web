<template>
  <div class="container">
    <el-form class="left" label-width="120px" style="width:300px" size="small">
      <el-form-item label="模块版本">
        <div>{{ info.version }}</div>
      </el-form-item>
      <el-form-item label="接入APP版本">
        <div>{{ info.appVersion }}</div>
      </el-form-item>
      <el-form-item label="当前状态">
        <div>{{ info.status }}</div>
      </el-form-item>
      <el-form-item label="Jenkins任务">
        <div>{{ info.jenkinsJob }}</div>
      </el-form-item>
      <el-form-item label="最新版本号">
        <div>{{ info.currentVersion }}</div>
      </el-form-item>
      <el-form-item label="已接入APP">
        <div>{{ info.imported }}</div>
      </el-form-item>
      <el-form-item label="已打prd版本">
        <div>{{ info.released }}</div>
      </el-form-item>
      <el-form-item label="成功构建次数">
        <div>{{ info.buildSuccess }}</div>
      </el-form-item>
      <el-form-item label="失败构建次数">
        <div>{{ info.buildFailed }}</div>
      </el-form-item>
      <el-form-item label="构建总数">
        <div>{{ info.buildCount }}</div>
      </el-form-item>
    </el-form>
    <div class="right hmid">
      <el-dialog title="构建版本" :visible.sync="buildDialogShow" center width='600px'
        :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" v-loading="submitBuildLoading">
        <el-form label-width="120px" style="width:450px" size="small">
          <el-form-item label="构建版本">
            <div>{{ buildParams.version }}</div>
          </el-form-item>
          <el-form-item label="当前阶段">
             <el-radio-group v-model="buildParams.released">
              <el-radio :label="false" :disabled="startBuilding">开发版本</el-radio>
              <el-radio :label="true" :disabled="startBuilding">生产版本</el-radio>
             </el-radio-group>
          </el-form-item>
          <el-form-item label="是否发布">
            <el-radio-group v-model="buildParams.publish">
              <el-radio :label="true" :disabled="startBuilding">发布版本</el-radio>
              <el-radio :label="false" :disabled="startBuilding">测试构建</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="startBuilding" label="构建状态">
            <div>{{buildStatusText}}</div>
          </el-form-item>
          <el-form-item v-if="startBuilding" label="构建耗时">
            <div>{{ buildDuration }}</div>
          </el-form-item>
          <el-form-item v-if="startBuilding" label="查看Jenkins">
            <el-button type="small" @click="jumpToJenkinsBuild">跳转到Jenkins</el-button>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button v-if="!jenkinsBuilding" @click="buildDialogShow = false">{{startBuilding ? '关闭' : '取消'}}</el-button>
          <el-button v-if="!buildFinished" type="danger" :loading="jenkinsBuilding" @click="buildAction">构建</el-button>
        </div>
      </el-dialog>
      <el-button v-if="canBuild" style="margin-top: 15px;width: 220px;" type="primary" @click="showBuildDialog" v-loading.fullscreen.lock="fullscreenLoading">构建</el-button>
      <el-dialog title="删除版本" :visible.sync="deleteDialogVisable" center width='500px' v-loading="deleteActionLoading">
        <div style="font-size: 20px;color: red;">确认当前模块 "{{ info.version }}" 版本 ？ 删除一些未开始的版本 或者需要取消的版本。 </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="deleteDialogVisable = false">取消</el-button>
          <el-button type="danger" @click="deleteAction">删除</el-button>
        </div>
      </el-dialog>
      <el-button v-if="canImport" style="margin-top: 15px;width: 220px;" type="primary">接入APP</el-button>
      <el-dialog title="删除版本" :visible.sync="deleteDialogVisable" center width='500px' v-loading="deleteActionLoading">
        <div style="font-size: 20px;color: red;">确认当前模块 "{{ info.version }}" 版本 ？ 删除一些未开始的版本 或者需要取消的版本。 </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="deleteDialogVisable = false">取消</el-button>
          <el-button type="danger" @click="deleteAction">删除</el-button>
        </div>
      </el-dialog>
      <el-button v-if="canDelete" style="margin-top: 15px;width: 220px;" type="danger" @click="deleteDialogVisable = true">删除版本</el-button>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import conf from '../../conf'
export default {
  name: 'ModuleVersionManager',
  props: {
    info: Object
  },
  data () {
    return {
      deleteDialogVisable: false,
      deleteActionLoading: false,
      buildDialogShow: false,
      buildDialogInitLoading: false,
      buildParams: {
        version: '',
        released: false,
        publish: true
      },
      buildInfo: {
        buildNumber: '',
        buildId: '',
        status: ''
      },
      fullscreenLoading: false,
      submitBuildLoading: false,
      buildStatusText: '',
      buildDuration: '', // 记录构建耗时
      buildFinished: false, // 完成构建时， 隐藏构建按钮
      startBuilding: false // 开始构建，暂时进度。
    }
  },
  methods: {
    showBuildDialog () {
      this.fullscreenLoading = true
      this.startBuilding = false
      this.buildFinished = false
      // 请求服务器， 查看当前jenkins任务是否空闲。
      axios.post('/api/jenkins/module/status', {
        moduleId: this.info.moduleId,
        jobName: this.info.jenkinsJob
      }).then(res => {
        this.fullscreenLoading = false
        if (res.data.error) {
          return this.$alert('检查jenkins状态出错， 报错内容 : \n' + res.data.error + '\n 请稍后重试！！！')
        }
        if (res.data.jobFree) {
          // 则可以构建
          this.buildDialogShow = true
          this.buildParams = {
            version: this.info.version,
            released: false,
            publish: true
          }
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
      let form = {
        moduleId: this.info.moduleId,
        versionId: this.info.versionId,
        jobName: this.info.jenkinsJob,
        parameters: {
          VERSION: this.buildParams.version,
          RELEASED: this.buildParams.released,
          PUBLISH: this.buildParams.publish
        }
      }
      axios.post('/api/jenkins/module/build', form).then(res => {
        this.submitBuildLoading = false
        if (res.data.error) {
          return this.$alert('jenkins 任务构建失败， 报错内容 : \n' + res.data.error + '\n 请稍后重试！！！')
        }
        // 构建调用成功.
        this.buildInfo = res.data
        let duration = 0
        let timer = setInterval(() => {
          if (this.buildFinished) {
            clearInterval(timer)
          }
          duration++
          let min = parseInt(duration / 60)
          let txt = ''
          if (min) {
            txt = min + ' 分钟 '
          }
          txt += duration % 60 + ' 秒'
          this.buildDuration = txt
        }, 1000)
        let startTime = new Date(this.buildInfo.startedTime)
        let estimatedDuration = parseInt(this.buildInfo.estimatedDuration / 60 / 1000)
        this.buildStatusText = `构建中，开始于${startTime.getHours()}:${startTime.getMinutes()} , 预计耗时 ${estimatedDuration} 分钟。`
        this.startBuilding = true
        this.info.buildCount++
        // 然后监控构建状态
        this.watchJenkinsBuild()
      }).catch(err => {
        this.submitBuildLoading = false
        this.$alert('构建jenkins任务时，发生异常， 报错内容 : \n' + err.message + '\n 请稍后重试！！！')
      })
    },
    jumpToJenkinsBuild () {

    },
    watchJenkinsBuild () {
      axios.get(`/api/jenkins/build?buildId=${this.buildInfo.buildId}`).then(res => {
        if (res.data.error) {
          this.buildInfo.status = conf.JENKINS_JOB_BUILD_STATUS_FAILURE
          this.buildStatusText = '构建失败 ！！！'
          this.buildFinished = true
          this.info.buildFailed++
          return this.$alert('检测jenkins构建状态时出现未知异常， 报错内容 : \n' + res.data.error + '\n 请检查出错原因！！！')
        }
        let status = res.data.status
        if (status === conf.JENKINS_JOB_BUILD_STATUS_BUILDING) {
          // 构建过程中， 设置5秒时间后继续查询
          setTimeout(() => {
            this.watchJenkinsBuild()
          }, 5000)
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
            this.info.currentVersion = this.buildInfo.newVersion
            this.info.buildSuccess++
          } else {
            this.info.buildFailed++
            this.buildStatusText = `构建失败， 当前状态${status} , 请检测Jenkins构建情况！！`
          }
        }
      }).catch(err => {
        this.buildFinished = true
        this.buildInfo.status = conf.JENKINS_JOB_BUILD_STATUS_FAILURE
        this.buildStatusText = '构建失败 ，发生网络异常 ！！！'
        this.info.buildFailed++
        this.$alert('检测jenkins构建状态时出现未知异常， 报错内容 : \n' + err.message + '\n 请检查出错原因！！！')
      })
    },
    deleteAction () {
      this.deleteActionLoading = true
      axios.post('/api/module/version/delete', {
        moduleId: this.info.moduleId,
        versionId: this.info.versionId
      }).then(res => {
        this.deleteActionLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            message: res.data.error,
            type: 'error',
            duration: 0
          })
        }
        this.$message({
          message: '版本删除成功 ！！！',
          type: 'success'
        })
        this.deleteDialogVisable = false
        setTimeout(() => {
          this.$router.replace(`/module-overview/${this.info.moduleId}`)
        }, 400)
      }).catch(err => {
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
        this.deleteActionLoading = false
      })
    }
  },
  computed: {
    canBuild () {
      return this.info.status === conf.TIMELINE_STATUS_DOING
    },
    canImport () {
      return this.info.status === conf.TIMELINE_STATUS_DOING && !this.info.imported && this.info.buildSuccess
    },
    canDelete () {
      return this.info.status !== conf.TIMELINE_STATUS_DONE && !this.info.imported
    },
    jenkinsBuilding () {
      return this.buildInfo.status === conf.JENKINS_JOB_BUILD_STATUS_BUILDING
    }
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
}
.left {
  min-width: 300px;
  max-width: 450px;
  height: 100%;
}
.right {
  widows: 200px;
  height: 100%;
}
</style>
