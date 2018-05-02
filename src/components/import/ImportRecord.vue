<template>
  <div class="container hmid" v-loading="loading">
    <div class="option">
      <div class="left">
        <div style="width: 180px;">APP版本 : </div>
        <el-input v-model="appVersion" placeholder="指定具体版本" clearable @keyup.enter.native="loadImportRecords"/>
        <div style="width: 110px; margin-left: 10px;">模块 : </div>
        <el-input v-model="moduleName" placeholder="指定具体模块" clearable @keyup.enter.native="loadImportRecords"/>
      </div>
      <el-button type="primary" @click="loadImportRecords" icon="el-icon-refresh">刷新</el-button>
    </div>
    <el-table :data="importList" border class="table">
      <el-table-column label="APP版本" prop="appVersion"/>
      <el-table-column label="模块" prop="module"/>
      <el-table-column label="模块版本">
        <template slot-scope="scope">
          <router-link :to="`/module/${scope.row.moduleId}/version/${scope.row.moduleVersion}`">{{ scope.row.moduleVersion }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="提起人" prop="applicant"/>
      <el-table-column label="提起时间" prop="applyTime"/>
      <el-table-column label="备注说明" prop="note"/>
      <el-table-column label="当前状态" prop="statusText"/>
      <el-table-column label="处理人" prop="handleUser"/>
      <el-table-column label="操作时间" prop="handleTime"/>
    </el-table>
    <el-pagination layout="prev,pager,next" :page-count="pageCount" :current-page.sync="pageNum" @current-change="loadImportRecords"/>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  name: 'ImportRecord',
  data () {
    return {
      appVersion: '',
      moduleName: '',
      pageCount: 1,
      pageNum: 1,
      loading: false,
      lastAppVersion: '', // 用于记录用户是否输入。
      lastModuleName: '',
      importList: []
    }
  },
  methods: {
    loadImportRecords () {
      this.loading = true
      let appVersion = this.appVersion.trim()
      let moduleName = this.moduleName.trim()
      if (appVersion !== this.lastAppVersion || moduleName !== this.lastModuleName) {
        this.pageNum = 1
        this.pageCount = 1
        this.lastAppVersion = appVersion
        this.lastModuleName = moduleName
      }
      let url = `/api/import/records?pageNum=${this.pageNum}`
      if (appVersion !== '') {
        url += '&appVersion=' + appVersion
      }
      if (moduleName !== '') {
        url += '&module=' + moduleName
      }

      axios.get(url).then(res => {
        this.loading = false
        if (res.data.error) {
          return this.$message({
            showClose: true,
            message: res.data.error,
            type: 'error',
            duration: 0
          })
        }
        let list = res.data.importList
        let statusList = ['等待处理', '接入失败', '接入成功', '拒绝接入']
        list.forEach(item => {
          item['statusText'] = statusList[item.status]
        })
        this.pageCount = parseInt(res.data.pageCount)
        this.importList = list
      }).catch(err => {
        this.loading = false
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
      })
    }
  },
  mounted () {
    this.pageCount = 1
    this.pageNum = 1
    this.loadImportRecords()
  }
}
</script>
<style scoped>
.option {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  width: 100%;
  margin-bottom: 20px;
}
.left {
  display: flex;
  height: 50px;
  justify-content: flex-start;
  align-items: center;
}
</style>
