<template>
  <div class="container" v-loading="submitLoading">
    <div class="left hmid">
      <el-input v-if="modifying" type="textarea" :autosize="{minRows: 10, maxRows: 24}" v-model="content"/>
      <el-form v-else label-width="120px" style="width:300px">
        <el-form-item label="模块名">
          <div>{{ overview.name }}</div>
        </el-form-item>
        <el-form-item label="类型">
          <div>{{ overview.type }}</div>
        </el-form-item>
        <el-form-item label="Jenkins任务">
          <a :href="jenkinsURL" target="_blank">{{ overview.jenkinsJob }}</a>
        </el-form-item>
        <el-form-item :label="overview.gitType + '地址'">
          <a :href="gitURL" target="_blank">查看仓库</a>
        </el-form-item>
        <el-form-item label="接入APP版本">
          <router-link :to="'/app/version/' + overview.appVersion">{{ overview.appVersion }}</router-link>
        </el-form-item>
        <el-form-item label="开发状态">
          <div>{{ overview.statusInfo }}</div>
        </el-form-item>
        <el-form-item label="最新版本号">
          <div>{{ overview.currentVersion }}</div>
        </el-form-item>
      </el-form>
    </div>
    <div class="right">
      <div class="title">更新记录</div>
      <div class="logbtn">
        <el-button v-if="moduleAdmin && modifying" @click="cancelChangeLog">取消</el-button>
        <el-button v-if="moduleAdmin && modifying" type="primary" @click="submitChangeLog">提交修改</el-button>
        <el-button v-if="canModify" type="primary" size="small" @click="modifyChangeLog">修改</el-button>
      </div>
      <div class="changelog">
        <markdown :content="content"/>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import Markdown from '../Markdown'
import conf from '../../conf'
import config from '../../conf/config'
export default {
  name: 'ModuleOverview',
  components: {
    'markdown': Markdown
  },
  data () {
    return {
      content: this.overview.changeLog,
      modifying: false,
      submitLoading: false,
      backup: ''
    }
  },
  props: {
    overview: Object,
    moduleAdmin: Boolean
  },
  computed: {
    canModify () {
      return this.moduleAdmin && !this.modifying && this.overview.status !== conf.TIMELINE_STATUS_DONE
    },
    jenkinsURL () {
      return config.jenkinsURL + '/job/' + this.overview.jenkinsJob
    },
    gitURL () {
      return this.overview.homeURL + '/tree/version/' + this.$route.params.version
    }
  },
  methods: {
    modifyChangeLog () {
      this.modifying = true
      this.backup = this.content
    },
    cancelChangeLog () {
      this.content = this.backup
      this.modifying = false
    },
    submitChangeLog () {
      this.submitLoading = true
      axios.post('/api/module/version/changelog', {
        moduleId: this.overview.moduleId,
        versionId: this.overview.versionId,
        changeLog: this.content
      }).then(res => {
        this.submitLoading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            type: 'error',
            message: res.data.error,
            duration: 0
          })
        }
        this.modifying = false
        this.$message({
          type: 'success',
          message: '修改版本更新日志成功！！'
        })
      }).catch(err => {
        this.submitLoading = false
        this.$message({
          showClose: true,
          type: 'error',
          message: err.message,
          duration: 0
        })
      })
    }
  }
}
</script>
<style scoped>
.container {
  width: 100%;
  min-width: 600px;
  height: 100%;
  box-sizing: border-box;
  min-height: 500px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
}
.left {
  min-width: 300px;
  max-width: 400px;
  height: 100%;
}
.right {
  width: 500px;
  margin-top: -20px;
}
.changelog {
  margin-top: 40px;
  height: calc(100vh - 135px);
  box-sizing: border-box;
  overflow: auto;
}
.title {
  position: absolute;
  font-weight: bold;
  -webkit-font-smoothing: antialiased;
  font-size: 24px;
  border-bottom: 1px solid #cccccc;
  color: black;
}
.logbtn {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
