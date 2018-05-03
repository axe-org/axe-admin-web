<template>
  <div v-loading="pageLoading">
    <div class="hmid" style="width: 50%; height: 100%;float: left;">
      <el-form label-width="120px" style="width:100%; align-self:flex-start;">
        <el-form-item label="版本">
          <div>{{ version }}</div>
        </el-form-item>
        <el-form-item label="创建时间" style="margin-top: -20px;">
          <div>{{ versionInfo.createdTime }}</div>
        </el-form-item>
        <el-form-item label="当前状态" style="margin-top: -20px;">
          <div>{{ versionInfo.statusInfo }}</div>
        </el-form-item>
        <el-form-item label="git仓库" style="margin-top: -20px;">
          <el-button size="small" plain @click="openGitPage">{{ 'version/' + version }}</el-button>
        </el-form-item>
        <el-form-item label="时间线" style="margin-top: -20px;">
          <el-button size="small" plain type="success" @click="openTimeline">查看</el-button>
        </el-form-item>
        <el-form-item label="模块数量" style="margin-top: -20px;">
          <div>{{ versionInfo.moduleCount }}</div>
        </el-form-item>
        <el-form-item label="未开始模块" style="margin-top: -20px;">
          <div>
            <el-button v-for="moduleVersion in unstartedModules" :key="moduleVersion.versionId" type="info" plain size="mini"
             class="module" @click="$router.push(`/module/${moduleVersion.moduleId}/version/${moduleVersion.version}`)">
             {{moduleVersion.name + ':' + moduleVersion.version}}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="开始中模块" style="margin-top: -20px;">
          <div>
            <el-button v-for="moduleVersion in developingModules" :key="moduleVersion.versionId" type="primary" plain size="mini"
             class="module" @click="$router.push(`/module/${moduleVersion.moduleId}/version/${moduleVersion.version}`)">
             {{moduleVersion.name + ':' + moduleVersion.version}}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="已接入模块" style="margin-top: -17px;">
          <div>
            <el-button v-for="moduleVersion in importedModules" :key="moduleVersion.versionId" type="success" plain size="mini"
             class="module" @click="$router.push(`/module/${moduleVersion.moduleId}/version/${moduleVersion.version}`)">
             {{moduleVersion.name + ':' + moduleVersion.version}}</el-button>
          </div>
        </el-form-item>
        <el-form-item label="已发布模块" style="margin-top: -17px;">
          <div>
            <el-button v-for="moduleVersion in releasedModules" :key="moduleVersion.versionId" type="success" size="mini"
             class="module" @click="$router.push(`/module/${moduleVersion.moduleId}/version/${moduleVersion.version}`)">
             {{moduleVersion.name + ':' + moduleVersion.version}}</el-button>
          </div>
        </el-form-item>
      </el-form>
      <el-button style="margin-top: 12px;width: 140px;" type="primary" @click="loadVersionInfo" icon="el-icon-refresh">刷新</el-button>
      <el-button style="margin-left: 0;margin-top: 10px;width: 140px;" type="danger" v-if="canDelete" @click="deleteVersion" icon="el-icon-delete">删除版本</el-button>
      <el-button style="margin-left: 0;margin-top: 10px;width: 140px;" type="warning" v-if="canReloadDependency" @click="reloadDependencyImg" icon="el-icon-picture">刷新结构图</el-button>
    </div>
    <div style="width: 50%; height: 100%;float: right;">
      <a ref="imgContainer" v-if="imgURL !== ''" :href="imgURL" target="_blank" style="height: 100%;display: flex;justify-content:center;aligin-items: center;">
        <img style="max-width: 100%;height: auto;" :src="imgURL"/>
      </a>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import conf from '../../conf'
import config from '../../conf/config'
export default {
  name: 'DetailInfo',
  props: {
    version: String
  },
  data () {
    return {
      pageLoading: false,
      versionInfo: {

      },
      unstartedModules: [],
      developingModules: [],
      importedModules: [],
      releasedModules: [],
      imgURL: ''
    }
  },
  computed: {
    canDelete () {
      // 版本可以删除。 当前无模块版本接入，且未完成的版本 可以进行删除
      return this.$store.state.appAdmin && this.versionInfo.versionInfo &&
        this.versionInfo.versionInfo.status !== conf.TIMELINE_STATUS_DONE &&
        this.versionInfo.moduleVersionList.length === 0
    },
    canReloadDependency () {
      return this.$store.state.appAdmin && this.versionInfo.versionInfo &&
        this.versionInfo.versionInfo.status === conf.TIMELINE_STATUS_DOING
    }
  },
  methods: {
    openGitPage () {
      window.open(config.appGitHome + '/tree/version/' + this.version)
    },
    deleteVersion () {
      this.$alert('确认删除该版本？？？', '标题名称', {
        showClose: false,
        center: true,
        showCancelButton: true,
        confirmButtonText: '确定'
      }).then(() => {
        axios.post('/api/app/delete', {version: this.version}).then(res => {
          if (res.data.error) {
            return this.$message({
              showClose: true,
              duration: 0,
              type: 'error',
              message: res.data.error
            })
          }
          this.$message.success(`成功删除 ${this.version} 版本`)
          this.$emit('delete')
        }).catch(err => {
          this.$message({
            showClose: true,
            duration: 0,
            type: 'error',
            message: err.message
          })
        })
      }).catch(() => {
      })
    },
    reloadDependencyImg () {
      this.pageLoading = true
      axios.post('/api/app/reloadStruct', {version: this.version}).then(res => {
        this.pageLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            duration: 0,
            type: 'error',
            message: res.data.error
          })
        }
        this.$message.success('刷新成功！')
        if (this.imgURL === '') {
          this.imgURL = `/api/static/app/${this.version}/dependency.svg`
        }
        setTimeout(() => {
          this.$refs['imgContainer'].innerHTML = `<img style="max-width: 100%;height: auto;" src="${this.imgURL}"/>`
        }, 100)
      }).catch(err => {
        this.pageLoading = false
        this.$message({
          showClose: true,
          duration: 0,
          type: 'error',
          message: err.message
        })
      })
    },
    openTimeline () {
      this.$emit('open', {
        type: 'timeline',
        title: '时间线-' + this.version,
        data: {
          lineId: this.versionInfo.lineID
        }
      })
    },
    loadVersionInfo () {
      this.pageLoading = true
      axios.get(`/api/app/version?version=${this.version}`).then(response => {
        this.pageLoading = false
        if (response.data.error) {
          return this.$message({
            showClose: true,
            message: response.data.error,
            type: 'error',
            duration: 0
          })
        }
        let version = response.data
        // 整理展示内容。
        version['version'] = version.versionInfo.version
        // 获取状态。
        if (version.versionInfo.status === conf.TIMELINE_STATUS_WAITING) {
          version['statusInfo'] = '未开始'
        } else if (version.versionInfo.status === conf.TIMELINE_STATUS_DONE) {
          version['statusInfo'] = '已完成'
        } else if (version.versionInfo.status === conf.TIMELINE_STATUS_DOING) {
          // 根据时间线情况输出状态.
          if (version.actions[conf.TIMELINE_ACTION_TYPE_SUBMIT].status === conf.TIMELINE_ACTION_STATUS_FINISHED) {
            version['statusInfo'] = '已提交审核'
          } else if (version.actions[conf.TIMELINE_ACTION_TYPE_TEST_FINISHED].status === conf.TIMELINE_ACTION_STATUS_FINISHED) {
            version['statusInfo'] = '测试完成'
          } else if (version.actions[conf.TIMELINE_ACTION_TYPE_DEVELOP_FINISHED].status === conf.TIMELINE_ACTION_STATUS_FINISHED) {
            version['statusInfo'] = '测试阶段'
          } else if (version.actions[conf.TIMELINE_ACTION_TYPE_START].status === conf.TIMELINE_ACTION_STATUS_FINISHED) {
            version['statusInfo'] = '开发中'
          }
        }
        version['createdTime'] = version.versionInfo.createdTime
        if (version.versionInfo.status === conf.TIMELINE_STATUS_DONE) {
          version['finishedTime'] = version.actions[conf.TIMELINE_ACTION_TYPE_FINISH].finishedTime
        } else {
          version['expectedTime'] = version.actions[conf.TIMELINE_ACTION_TYPE_FINISH].expectedTime
        }
        version['lineID'] = version.versionInfo.timelineId
        version['moduleCount'] = version.moduleVersionList.length

        version['versionId'] = version.versionInfo.versionId
        // 统计模块开发状态
        let unstartedModules = []
        let developingModules = []
        let importedModules = []
        let releasedModules = []
        version.moduleVersionList.forEach(moduleVersion => {
          if (moduleVersion.status === conf.TIMELINE_STATUS_WAITING) {
            unstartedModules.push(moduleVersion)
          } else {
            if (moduleVersion.released === 1) {
              releasedModules.push(moduleVersion)
            } else if (moduleVersion.imported === 1) {
              importedModules.push(moduleVersion)
            } else {
              developingModules.push(moduleVersion)
            }
          }
        })
        this.unstartedModules = unstartedModules
        this.developingModules = developingModules
        this.importedModules = importedModules
        this.releasedModules = releasedModules
        this.versionInfo = version
      }).catch(err => {
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
        this.pageLoading = false
      })
    }
  },
  mounted () {
    this.loadVersionInfo()
    let imgURL = `/api/static/app/${this.version}/dependency.svg`
    axios.head(imgURL).then(res => {
      this.imgURL = imgURL
    }).catch(() => {
      this.imgURL = ''
    })
  }
}
</script>

<style scoped>
.module {
  margin-right: -4px;
  padding: 7px 6px;
}
</style>
