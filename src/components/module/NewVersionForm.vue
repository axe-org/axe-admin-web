<template>
  <div class="hmid">
    <el-dialog style="margin-top:-12vh;" title="创建新版本" :visible.sync="addVersionDialogVisible" center width="650px" v-loading="submitLoading" :append-to-body="true">
        <el-form :model="newVersion" inline-message ref="newVersionForm"
         :rules="rules" label-width="120px">
          <el-form-item label="版本号" prop="version" style="margin-top: -15px">
            <el-input v-model="newVersion.version" :maxlength='11' style="width: 220px;"></el-input>
          </el-form-item>
          <el-form-item label="APP版本" style="margin-top: -15px" prop="appVersion">
            <el-select v-model="newVersion.appVersion" placeholder="请选中APP版本">
              <el-option-group v-for="group in optionList" :key="group.label" :label="group.label">
                <el-option v-for="item in group.options" :key="item.value" :value="item.value" :label="item.label"/>
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="更新日志" style="margin-top: -15px">
            <el-input type="textarea" :rows="3" placeholder="支持markdown语法，最多但是不能超过500字" v-model="newVersion.changeLog" :maxlength='500' style="width: 450px;"></el-input>
          </el-form-item>
          <el-form-item :label="title.startTime" prop="startTime" style="margin-top: -15px">
            <el-date-picker v-model="newVersion.startTime" type="date" placeholder="选择日期"/>
            <div class="desc">{{ desc['startTime'] }}</div>
          </el-form-item>
          <el-form-item :label="title.developFinished" prop="developFinished" style="margin-top: -15px">
            <el-date-picker v-model="newVersion.developFinished" type="date" placeholder="选择日期"/>
            <div class="desc">{{ desc['developFinished'] }}</div>
          </el-form-item>
          <el-form-item :label="title.testFinished" prop="testFinished" style="margin-top: -15px">
            <el-date-picker v-model="newVersion.testFinished" type="date" placeholder="选择日期"/>
            <div class="desc">{{ desc['testFinished'] }}</div>
          </el-form-item>
          <el-form-item :label="title.submitTime" prop="submitTime" style="margin-top: -15px">
            <el-date-picker v-model="newVersion.submitTime" type="date" placeholder="选择日期"/>
            <div class="desc">{{ desc['submitTime'] }}</div>
          </el-form-item>
          <el-form-item :label="title.finishedTime" prop="finishedTime" style="margin-top: -15px">
            <el-date-picker v-model="newVersion.finishedTime" type="date" placeholder="选择日期"/>
            <div class="desc">{{ desc['finishedTime'] }}</div>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="margin-top: -40px;">
            <el-button @click="addVersionDialogVisible = false">取消</el-button>
            <el-button @click="submitModuleVersion" type="primary">确定</el-button>
        </div>
      </el-dialog>
      <el-button type="primary" @click="showVersionDialog">添加版本</el-button>
  </div>
</template>

<script>
import axios from 'axios'
// import event from '../../event'
// import types from '../../event/types'
import conf from '../../conf'
export default {
  data () {
    return {
      optionList: [],
      newVersion: {
        version: '',
        startTime: '',
        developFinished: '',
        testFinished: '',
        submitTime: '',
        finishedTime: '',
        changeLog: '',
        appVersion: ''
      },
      desc: {
        startTime: '随便选一个开始时间， 需求开始也是开始。',
        developFinished: '基本完成模块开发。',
        testFinished: '自测完成，接入APP版本中。',
        submitTime: '构建模块的生产版本。',
        finishedTime: '模块版本彻底完成，可以构建prd版本为结束时间，也可以APP上线为结束时间。'
      },
      title: {
        startTime: '开始时间',
        developFinished: '开发完成时间',
        testFinished: '接入APP时间',
        submitTime: 'release构建时间',
        finishedTime: '完成时间'
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
        ],
        appVersion: [
          {type: 'number', required: true, message: '请选中APP版本号！！！'}
        ]
      },
      submitLoading: false,
      addVersionDialogVisible: false
    }
  },
  name: 'NewModuleVirsionForm',
  props: {
    moduleId: {
      type: String
    }
  },
  methods: {
    showVersionDialog () {
      this.addVersionDialogVisible = true
      this.submitLoading = true
      axios.get(`/api/app/ongoing`).then(res => {
        this.submitLoading = false
        if (res.data.error) {
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
              value: version.versionId
            })
          } else {
            startedVersions.push({
              label: version.version,
              value: version.versionId
            })
          }
        })
        if (unStartVersions.length === 0 && startedVersions.length === 0) {
          return this.$message({
            showClose: true,
            message: '请先添加APP版本， 模块版本必须跟随APP版本进行开发与管理！！！',
            type: 'error',
            duration: 0
          })
        }
        if (unStartVersions.length) {
          options.push({
            label: '未开始',
            options: unStartVersions
          })
        }
        if (startedVersions.length) {
          options.push({
            label: '进行中',
            options: startedVersions
          })
        }
        this.optionList = options
      }).catch(err => {
        this.submitLoading = false
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
      })
    },
    submitModuleVersion () {
      console.log(this.newVersion)
      this.$refs['newVersionForm'].validate((valid) => {
        if (valid) {
          // 再对提交时间做一些简单的限制：
          if (this.newVersion.startTime >= this.newVersion.developFinished) {
            return this.$message({
              showClose: true,
              message: '开发完成时间应该在项目开始时间之后。',
              type: 'error',
              duration: 0
            })
          }
          if (this.newVersion.developFinished >= this.newVersion.testFinished) {
            return this.$message({
              showClose: true,
              message: '测试完成时间应该在开发完成时间之后。',
              type: 'error',
              duration: 0
            })
          }
          if (this.newVersion.testFinished >= this.newVersion.submitTime) {
            return this.$message({
              showClose: true,
              message: '提交审核时间应该在测试完成之后。',
              type: 'error',
              duration: 0
            })
          }
          if (this.newVersion.submitTime >= this.newVersion.finishedTime) {
            return this.$message({
              showClose: true,
              message: '项目完成时间应该在提交审核之后。',
              type: 'error',
              duration: 0
            })
          }
          // 项目间隔不能超过三个月。
          if (this.newVersion.finishedTime.getTime() >= Date.now() + 30 * 24 * 60 * 60 * 1000) {
            return this.$message({
              showClose: true,
              message: '项目计划不能超过三个月！！！',
              type: 'error',
              duration: 0
            })
          }

          this.submitLoading = true
          let form = {
            moduleId: Number(this.moduleId),
            appVersionId: this.newVersion.appVersion,
            version: this.newVersion.version,
            changeLog: this.newVersion.changeLog,
            actions: []
          }
          let actions = ['startTime', 'developFinished', 'testFinished', 'submitTime', 'finishedTime']
          actions.forEach((action, index) => {
            form.actions.push({
              type: index + 1,
              title: this.title[action],
              detail: this.desc[action],
              expectedTime: this.newVersion[action]
            })
          })
          axios.post(`/api/module/version/create`, form).then(response => {
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
              // 创建成功，清空表单，以及发送成功通知
              this.addVersionDialogVisible = false
              this.newVersion = {
                version: '',
                startTime: '',
                developFinished: '',
                testFinished: '',
                submitTime: '',
                finishedTime: '',
                changeLog: '',
                appVersion: ''
              }
              this.$emit('success')
            }
            this.submitLoading = false
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.main-container {
  height: 100%;
  width: 100%;
}
.top-float {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
.desc {
  margin-top: 5px;
  color: #909399;
  line-height: 15px;
  font-size: 13px;
}
</style>
