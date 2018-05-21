<template>
  <div class="hmid" v-loading="listLoading">
    <div class="option">
      <el-radio-group v-model="selectedType" @change="loadVersionList">
        <el-radio-button label="进行中"/>
        <el-radio-button label="已完成"/>
      </el-radio-group>
      <div class="option-right">
        <el-dialog :append-to-body="true" style="margin-top: -10vh;" title="添加版本" :visible.sync="addVersionDialogVisible" center width="650px" :show-close="false" v-loading="submitLoading">
          <el-form :model="newAppVersion" ref="newAppVersionForm" inline-message :rules="rules" label-width="120px">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="newAppVersion.version" :maxlength='11' style="width: 220px;"></el-input>
            </el-form-item>
            <el-form-item :label="title.startTime" style="margin-top: -12px" prop="startTime">
              <el-date-picker v-model="newAppVersion.startTime" type="date" placeholder="选择日期"/>
              <br/><div class="desc">{{ desc['startTime'] }}</div>
            </el-form-item>
            <el-form-item :label="title.developFinished" style="margin-top: -12px" prop="developFinished">
              <el-date-picker v-model="newAppVersion.developFinished" type="date" placeholder="选择日期"/>
              <br/><div class="desc">{{ desc['developFinished'] }}</div>
            </el-form-item>
            <el-form-item :label="title.testFinished" style="margin-top: -12px" prop="testFinished">
              <el-date-picker v-model="newAppVersion.testFinished" type="date" placeholder="选择日期"/>
              <br/><div class="desc">{{ desc['testFinished'] }}</div>
            </el-form-item>
            <el-form-item :label="title.submitTime" style="margin-top: -12px" prop="submitTime">
              <el-date-picker v-model="newAppVersion.submitTime" type="date" placeholder="选择日期"/>
              <br/><div class="desc">{{ desc['submitTime'] }}</div>
            </el-form-item>
            <el-form-item :label="title.finishedTime" style="margin-top: -12px" prop="finishedTime">
              <el-date-picker v-model="newAppVersion.finishedTime" type="date" placeholder="选择日期"/>
              <br/><div class="desc">{{ desc['finishedTime'] }}</div>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addVersionDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitNewVersion">创 建</el-button>
          </div>
        </el-dialog>
        <el-button v-if="appAdmin" type="primary" icon="el-icon-plus" @click="addVersionDialogVisible = true">新建版本</el-button>
        <el-button type="primary" icon="el-icon-refresh" @click="loadVersionList">刷新</el-button>
      </div>
    </div>
    <el-table ref="versionList" :data="versionList" border>
        <el-table-column label="版本" align="center">
          <template slot-scope="scope">
            <el-button size="small" @click="openVersionDetail(scope.row.version)" plain type="primary">{{ scope.row.version }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="当前状态" prop="statusInfo"></el-table-column>
        <el-table-column label="创建时间" width="150px" prop="createdTime"></el-table-column>
        <el-table-column align="center" v-if="searchOngoingList" label="预计完成时间" prop="expectedTime"></el-table-column>
        <el-table-column v-else label="完成时间" align="center" prop="finishedTime"></el-table-column>
        <el-table-column label="查看详细时间线" align="center">
          <template slot-scope="scope">
            <el-button size="small" plain type="success" @click="openTimeline(scope.row)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" label="模块数量" prop="moduleCount"></el-table-column>
        <el-table-column label="git仓库" align="center">
          <template slot-scope="scope">
            <el-button size="small" plain type="success" @click="openGitPage(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination :current-page.sync="pageNum" layout="prev, pager, next" :page-count="pageCount" @current-change="loadVersionList" small/>
  </div>
</template>
<script>
import axios from 'axios'
import conf from '../../conf'
import config from '../../conf/config'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      selectedType: '进行中',
      listLoading: false,
      versionList: [],
      pageNum: 1,
      pageCount: 1,
      addVersionDialogVisible: false,
      newAppVersion: {
        version: '',
        startTime: '',
        developFinished: '',
        testFinished: '',
        submitTime: '',
        finishedTime: ''
      },
      desc: {
        startTime: '具体版本立项的时间。',
        developFinished: '所有该版本上的模块都必须完成开发自测，并且接入到版本中。',
        testFinished: '测试完成时，必须完成所有模块的发布。',
        submitTime: '提交APP Store审核时间节点。',
        finishedTime: '整个版本完成时间，建议在版本发布后，跟进一段时间的生产问题后，才关闭项目。'
      },
      title: {
        startTime: '版本开始',
        developFinished: '开发完成',
        testFinished: '测试完成',
        submitTime: '提交审核',
        finishedTime: '版本完成'
      },
      rules: {
        version: [
          { type: 'string', required: true, message: '请输入版本号', trigger: 'blur' },
          { min: 5, max: 11, pattern: /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/, message: '请输入正确的三段式版本号', trigger: 'blur' }
        ],
        startTime: [
          { type: 'date', required: true, message: '请设置版本开始时间', trigger: 'change' }
        ],
        developFinished: [
          { type: 'date', required: true, message: '请设置版本开发完成时间', trigger: 'change' }
        ],
        testFinished: [
          { type: 'date', required: true, message: '请设置版本测试完成时间', trigger: 'change' }
        ],
        submitTime: [
          { type: 'date', required: true, message: '请设置版本提交审核时间', trigger: 'change' }
        ],
        finishedTime: [
          { type: 'date', required: true, message: '请设置版本完成时间', trigger: 'change' }
        ]
      },
      submitLoading: false
    }
  },
  computed: {
    ...mapState(['appAdmin']),
    searchOngoingList () {
      return this.selectedType === '进行中'
    }
  },
  name: 'APPVersionList',
  methods: {
    openGitPage (versionInfo) {
      window.open(config.appGitHome + '/tree/version/' + versionInfo.version)
    },
    openVersionDetail (version) {
      this.$emit('open', {
        type: 'detail',
        title: version,
        data: {
          version: version
        }
      })
    },
    openTimeline (versionInfo) {
      this.$emit('open', {
        type: 'timeline',
        title: '时间线-' + versionInfo.version,
        data: {
          lineId: versionInfo.lineID
        }
      })
    },
    submitNewVersion () {
      this.$refs['newAppVersionForm'].validate((valid) => {
        if (valid) {
          // 再对提交时间做一些简单的限制：
          if (this.newAppVersion.startTime >= this.newAppVersion.developFinished) {
            return this.$message({
              showClose: true,
              message: '开发完成时间应该在项目开始时间之后。',
              type: 'error',
              duration: 0
            })
          }
          if (this.newAppVersion.developFinished >= this.newAppVersion.testFinished) {
            return this.$message({
              showClose: true,
              message: '测试完成时间应该在开发完成时间之后。',
              type: 'error',
              duration: 0
            })
          }
          if (this.newAppVersion.testFinished >= this.newAppVersion.submitTime) {
            return this.$message({
              showClose: true,
              message: '提交审核时间应该在测试完成之后。',
              type: 'error',
              duration: 0
            })
          }
          if (this.newAppVersion.submitTime >= this.newAppVersion.finishedTime) {
            return this.$message({
              showClose: true,
              message: '项目完成时间应该在提交审核之后。',
              type: 'error',
              duration: 0
            })
          }
          // 项目间隔不能超过三个月。
          if (this.newAppVersion.finishedTime.getTime() >= Date.now() + 3 * 30 * 24 * 60 * 60 * 1000) {
            return this.$message({
              showClose: true,
              message: '项目计划不能超过三个月！！！',
              type: 'error',
              duration: 0
            })
          }

          this.submitLoading = true
          let form = {
            version: this.newAppVersion.version,
            actions: []
          }
          let actions = ['startTime', 'developFinished', 'testFinished', 'submitTime', 'finishedTime']
          actions.forEach((action, index) => {
            form.actions.push({
              type: index + 1,
              title: this.title[action],
              detail: this.desc[action],
              expectedTime: this.newAppVersion[action]
            })
          })
          axios.post(`/api/app/create`, form).then(response => {
            this.submitLoading = false
            if (response.data.error) {
              this.$message({
                showClose: true,
                message: response.data.error,
                type: 'error',
                duration: 0
              })
            } else {
              this.$message({
                message: '创建成功！！',
                type: 'success'
              })
              this.addVersionDialogVisible = false
              this.newAppVersion = {
                version: '',
                startTime: '',
                developFinished: '',
                testFinished: '',
                submitTime: '',
                finishedTime: ''
              }
              this.loadVersionList()
            }
          }).catch(err => {
            this.$message({
              showClose: true,
              message: err.message,
              type: 'error',
              duration: 0
            })
            this.submitLoading = false
          })
        }
      })
    },
    loadVersionList () {
      this.listLoading = true
      axios.get(`/api/app/list/?pageNum=${this.pageNum}&ongoing=` + (this.searchOngoingList ? 1 : 0)).then(res => {
        this.listLoading = false
        if (res.data.error) {
          return this.$message({
            duration: 0,
            type: 'error',
            message: res.data.error,
            showClose: true
          })
        }
        let versionList = res.data.versionList
        versionList.forEach(version => {
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
        })
        this.versionList = versionList
        this.pageCount = res.data.pageCount
      }).catch(err => {
        this.listLoading = false
        this.$message({
          duration: 0,
          type: 'error',
          message: err.message,
          showClose: true
        })
      })
    }
  },
  mounted () {
    this.loadVersionList()
  }
}
</script>
<style scoped>
.option {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 50px;
  justify-content: space-between
}
.option-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  justify-content: flex-end
}
.desc {
  margin-top: 5px;
  color: #909399;
  line-height: 15px;
  font-size: 13px;
}
</style>
