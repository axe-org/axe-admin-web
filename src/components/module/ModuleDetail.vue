<template>
  <el-tabs v-model="activeTab" style="width: 100%; height:100%;" v-loading="versionInfoLoading">
    <el-tab-pane label="版本信息" class="container" name="changeLog">
      <version-overview v-if="initialLoaded" :overview="versionOverview" :module-admin="moduleAdmin"/>
    </el-tab-pane>
    <el-tab-pane label="API详情" name="api">
      <markdown class="scroll-main-view" :content="APIContent"/>
    </el-tab-pane>
    <el-tab-pane label="时间线" name="timeline">
      <module-timeline v-if="initialLoaded" :module-line-id="moduleVersionInfo.timelineId" :module-admin="moduleAdmin" @refresh="loadVersionInfo"/>
    </el-tab-pane>
    <el-tab-pane label="依赖情况" name="dependency">
      <div v-if="initialLoaded && dependencyImage !== ''" class="scroll-main-view" style="margin-top: 20px;display: flex;justify-content:center;aligin-items: center;">
        <img :src="dependencyImage" @click="openDenpencyImage">
      </div>
    </el-tab-pane>
    <el-tab-pane label="管理" name="manager" v-if="moduleAdmin">
      <version-manager :info="versionManagerInfo"/>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import axios from 'axios'
import VersionOverview from './VersionOverview'
import ModuleTimeline from '../timeline/Module'
import VersionManager from './VersionManager'
import Markdown from '../Markdown'
import conf from '../../conf'
export default {
  name: 'ModuleDetail',
  components: {
    'version-overview': VersionOverview,
    'module-timeline': ModuleTimeline,
    'markdown': Markdown,
    'version-manager': VersionManager
  },
  data () {
    return {
      activeTab: 'changeLog',
      versionInfoLoading: false,
      moduleVersionInfo: {
        // versionId: '',
        // moduleId: '',
        // appVersionId: '',
        // imported: '',
        // version: '',
        // versionCode: '',
        // currentVersion: '',
        // buildCount: '',
        // buildFailed: '',
        // buildSuccess: '',
        // createdTime: '',
        // released: '',
        // changeLog: '',
        // status: '',
        // timelineId: ''
      },
      appVersionInfo: {

      },
      timelineInfo: {

      },
      moduleInfo: {

      },
      initialLoaded: false,
      versionOverview: {},
      versionManagerInfo: {},
      dependencyImage: '',
      APIContent: ''
    }
  },
  computed: {
    moduleAdmin () {
      return this.$store.state.moduleIdList.includes(parseInt(this.$route.params.moduleId))
    },
    moduleId () {
      return parseInt(this.$route.params.moduleId)
    }
  },
  methods: {
    openDenpencyImage () {
      if (this.dependencyImage !== '') {
        window.open(this.dependencyImage)
      }
    },
    loadVersionInfo () {
      this.versionInfoLoading = true
      axios.post('/api/module/version/info', {
        moduleId: this.$route.params.moduleId,
        version: this.$route.params.version
      }).then(res => {
        this.versionInfoLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: res.data.error,
            duration: 0
          })
        }
        this.moduleVersionInfo = res.data.moduleVersionInfo
        this.timelineInfo = res.data.timelineInfo
        this.appVersionInfo = res.data.appVersionInfo
        this.moduleInfo = res.data.moduleInfo
        console.log(res.data)
        document.title = `${this.moduleInfo.name}/${this.$route.params.version}`
        // 组装数据
        let overview = {}
        overview['name'] = this.moduleInfo.name
        overview['type'] = this.moduleInfo.type
        overview['jenkinsJob'] = this.moduleInfo.jenkinsJob
        overview['gitType'] = this.moduleInfo.gitType
        overview['homeURL'] = this.moduleInfo.homeURL
        overview['versionId'] = this.moduleVersionInfo.versionId
        overview['moduleId'] = this.moduleInfo.moduleId
        overview['status'] = this.moduleVersionInfo.status
        let statusInfo = '未开始'
        if (this.moduleVersionInfo.status === conf.TIMELINE_STATUS_DOING) {
          if (this.moduleVersionInfo.released) {
            statusInfo = '已发布生产版本'
          } else if (this.moduleVersionInfo.imported) {
            statusInfo = '已接入APP版本'
          } else {
            statusInfo = '开发中'
          }
        } else if (this.moduleVersionInfo.status === conf.TIMELINE_STATUS_DONE) {
          statusInfo = '已完成'
        }
        overview['statusInfo'] = statusInfo

        overview['changeLog'] = this.moduleVersionInfo.changeLog
        overview['currentVersion'] = this.moduleVersionInfo.currentVersion
        overview['appVersion'] = this.appVersionInfo.version
        this.versionOverview = overview

        // 组装数据
        let info = {}
        info['version'] = this.moduleVersionInfo.version
        info['appVersion'] = this.appVersionInfo.version
        info['jenkinsJob'] = this.moduleInfo.jenkinsJob
        info['status'] = this.moduleVersionInfo.status
        info['currentVersion'] = this.moduleVersionInfo.currentVersion ? this.moduleVersionInfo.currentVersion : '未构建'
        info['imported'] = this.moduleVersionInfo.imported
        info['released'] = this.moduleVersionInfo.released
        info['buildSuccess'] = this.moduleVersionInfo.buildSuccess
        info['buildFailed'] = this.moduleVersionInfo.buildFailed
        info['buildCount'] = this.moduleVersionInfo.buildCount
        info['moduleId'] = this.moduleInfo.moduleId
        info['versionId'] = this.moduleVersionInfo.versionId
        this.versionManagerInfo = info
        console.log(info)
        this.initialLoaded = true
        let dependencyImage = `/api/static/module/${this.moduleVersionInfo.versionId}/dependency.svg`
        axios.head(dependencyImage).then(() => {
          this.dependencyImage = dependencyImage
        }).catch(err => {
          console.log(err)
        })
        axios.get(`/api/static/module/${this.moduleVersionInfo.versionId}/API.h`).then(res => {
          // 设置markdown 代码格式，即每行开头添加一个tab
          let rowContent = '    ' + res.data
          this.APIContent = rowContent.replace(/\n/g, '\n    ')
        }).catch(err => {
          console.log(err)
          // 加载失败，暂时错误页面
        })
      }).catch(err => {
        this.versionInfoLoading = false
        this.$message({
          showClose: true,
          type: 'error',
          message: err.message,
          duration: 0
        })
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.initialLoaded = false
      vm.loadVersionInfo()
    })
  },
  beforeRouteUpdate (to, from, next) {
    next()
    this.initialLoaded = false
    this.loadVersionInfo()
  }
}
</script>
<style scoped>
.container {
  width: 100%;
}
.scroll-main-view {
  height: calc(100vh - 100px);
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
