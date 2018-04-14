<template>
  <div class="main-container hmid">
    <el-form :model="newAppVersion" ref="newAppVersionForm" :rules="rules" label-width="120px" v-loading="submitLoading">
      <el-form-item label="版本号" prop="version">
        <el-input v-model="newAppVersion.version" :maxlength='11' style="width: 220px;"></el-input>
      </el-form-item>
      <el-form-item :label="title.startTime" prop="startTime">
        <el-date-picker v-model="newAppVersion.startTime" type="date" placeholder="选择日期"/>
        <br/><span style="color: #909399">{{ desc['startTime'] }}</span>
      </el-form-item>
      <el-form-item :label="title.developFinished" prop="developFinished">
        <el-date-picker v-model="newAppVersion.developFinished" type="date" placeholder="选择日期"/>
        <br/><span style="color: #909399">{{ desc['developFinished'] }}</span>
      </el-form-item>
      <el-form-item :label="title.testFinished" prop="testFinished">
        <el-date-picker v-model="newAppVersion.testFinished" type="date" placeholder="选择日期"/>
        <br/><span style="color: #909399">{{ desc['testFinished'] }}</span>
      </el-form-item>
      <el-form-item :label="title.sumbitTime" prop="sumbitTime">
        <el-date-picker v-model="newAppVersion.sumbitTime" type="date" placeholder="选择日期"/>
        <br/><span style="color: #909399">{{ desc['sumbitTime'] }}</span>
      </el-form-item>
      <el-form-item :label="title.finishedTime" prop="finishedTime">
        <el-date-picker v-model="newAppVersion.finishedTime" type="date" placeholder="选择日期"/>
        <br/><span style="color: #909399">{{ desc['finishedTime'] }}</span>
      </el-form-item>
    </el-form>
    <br/>
    <el-button type="primary" @click="submitNewVersion">提 交</el-button>
  </div>
</template>

<script>
import axios from 'axios'
import event from '../../event'
import types from '../../event/types'
// import conf from '../../conf'
export default {
  data () {
    return {
      newAppVersion: {
        version: '',
        startTime: '',
        developFinished: '',
        testFinished: '',
        sumbitTime: '',
        finishedTime: ''
      },
      desc: {
        startTime: '随便选一个开始时间， 需求开始也是开始。',
        developFinished: '开发完成之前，所有该版本上的组件必须完成接入。',
        testFinished: '测试完成之前，必须完成所有模块的封板，即所有模块测试通过，打prd版本。',
        sumbitTime: '提交APP Store审核时间。',
        finishedTime: '整个版本完成时间，所有时间不能修改，这里只是简单记录与统计，不是完全的任务管理，所以不做任务延期处理。'
      },
      title: {
        startTime: '开始时间',
        developFinished: '开发完成时间',
        testFinished: '测试完成时间',
        sumbitTime: '提交审核',
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
        sumbitTime: [
          { type: 'date', required: true, message: '请设置版本提交审核时间', trigger: 'change' }
        ],
        finishedTime: [
          { type: 'date', required: true, message: '请设置版本完成时间', trigger: 'change' }
        ]
      },
      submitLoading: false
    }
  },
  name: 'AppForm',
  beforeRouteEnter (to, from, next) {
    next(vm => {
      document.title = '创建新版本'
    })
  },
  methods: {
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
          if (this.newAppVersion.testFinished >= this.newAppVersion.sumbitTime) {
            return this.$message({
              showClose: true,
              message: '提交审核时间应该在测试完成之后。',
              type: 'error',
              duration: 0
            })
          }
          if (this.newAppVersion.sumbitTime >= this.newAppVersion.finishedTime) {
            return this.$message({
              showClose: true,
              message: '项目完成时间应该在提交审核之后。',
              type: 'error',
              duration: 0
            })
          }
          // 项目间隔不能超过三个月。
          if (this.newAppVersion.finishedTime.getTime() >= Date.now() + 30 * 24 * 60 * 60 * 1000) {
            return this.$message({
              showClose: true,
              message: '项目计划不能成果三个月！！！',
              type: 'error',
              duration: 0
            })
          }

          this.submitLoading = true
          let form = {
            version: this.newAppVersion.version,
            actions: []
          }
          let actions = ['startTime', 'developFinished', 'testFinished', 'sumbitTime', 'finishedTime']
          actions.forEach((action, index) => {
            form.actions.push({
              type: index + 1,
              title: this.title[action],
              detail: this.desc[action],
              expectedTime: this.newAppVersion[action]
            })
          })
          axios.post(`/api/app/create`, form).then(response => {
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
              // 跳转加刷新数据
              this.$router.replace('/app/version/' + form.version)
              event.$emit(types.APP_VERSION_CREATED, response.data)
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
</style>
