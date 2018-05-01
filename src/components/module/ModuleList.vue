<template>
  <div class="container">
    <div class="option">
      <div class="option-left">
        <el-checkbox v-model="selectMine" label="只看我的" border></el-checkbox>
        <span class="label">类型:</span>
        <el-radio-group v-model="selectedType" size="medium">
          <el-radio-button label="全部"></el-radio-button>
          <el-radio-button label="iOS"></el-radio-button>
          <el-radio-button label="html"></el-radio-button>
          <el-radio-button label="react"></el-radio-button>
        </el-radio-group>
      </div>
      <div class="option-right">
        <el-button type="primary" icon="el-icon-plus" @click="addModuleDialogVisible = true">添加</el-button>
        <el-input placeholder="模块名" v-model="searchName" style="margin-left: 20px;width: 200px;">
          <el-button slot="append" icon="el-icon-search" @click="loadModuleList"></el-button>
        </el-input>
      </div>
    </div>
    <el-table :data="moduleList" v-loading="listLoading" border class="module-table">
      <el-table-column label="模块名">
        <template slot-scope="scope">
          <router-link :to="`/module-overview/` + scope.row.moduleId">{{scope.row.name}}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type"/>
      <el-table-column label="负责人">
        <template slot-scope="scope">
          {{ scope.row.userList.join(',')}}
        </template>
      </el-table-column>
      <el-table-column label="Jenkins任务">
        <template slot-scope="scope">
          <a :href="scope.row.jenkinsURL" target="_blank">{{ scope.row.jenkinsJob }}</a>
        </template>
      </el-table-column>
      <el-table-column label="仓库地址">
        <template slot-scope="scope">
          <a :href="scope.row.homeURL" target="_blank">{{ scope.row.gitType }}</a>
        </template>
      </el-table-column>
      <el-table-column label="版本数量" prop="versionCount"/>
      <el-table-column label="最新prd版本">
        <template slot-scope="scope">
          <router-link to="todo" v-if="scope.row.maxPrdVersion">{{ scope.row.maxPrdVersion }}</router-link>
        </template>
      </el-table-column>
      <el-table-column label="开发中版本">
        <template slot-scope="scope">
          <router-link to="todo" v-for="item in scope.row.onGoingList" :key="item.version">{{item.version}}</router-link>
        </template>
      </el-table-column>
    </el-table>
    <div class="hmid">
      <el-pagination layout="prev, pager, next" :total="pageCount" :current-page.sync="pageNum" @current-change="loadModuleList"/>
    </div>
    <el-dialog title="添加模块" :visible.sync="addModuleDialogVisible" center width="500px" v-loading="addModuleLoading">
      <el-form :model="addModuleInfo" ref="addModuleFrom" :rules="rules" label-width="120px">
        <el-form-item label="模块名" prop="name">
          <el-input v-model="addModuleInfo.name" :maxlength="30" style="width: 250px"/>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="addModuleInfo.type" size="small">
            <el-radio-button label="iOS"/>
            <el-radio-button label="html"/>
            <el-radio-button label="react"/>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Jenkins构建任务名" prop="jenkinsJob">
          <el-input v-model="addModuleInfo.jenkinsJob" :maxlength="40" style="width: 220px"/>
        </el-form-item>
        <el-form-item label="仓库地址" prop="homeURL">
          <el-input v-model="addModuleInfo.homeURL" :maxlength="100" style="width: 200px"/>
        </el-form-item>
        <el-form-item label="git类型">
          <el-radio-group v-model="addModuleInfo.gitType" size="small">
            <el-radio-button label="gitlab"/>
            <el-radio-button label="github"/>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addModuleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitNewModule">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
// import conf from '../../conf'
export default {
  name: 'ModuleList',
  data () {
    return {
      selectMine: false,
      selectedType: '全部',
      searchName: '',
      moduleList: [],
      listLoading: false,
      pageCount: 1,
      pageNum: 1,
      addModuleDialogVisible: false,
      addModuleInfo: {
        name: '',
        type: 'iOS',
        jenkinsJob: '',
        homeURL: '',
        gitType: 'gitlab'
      },
      rules: {
        name: [
          {type: 'string', required: true, message: '请输入模块名', trigger: 'blur'},
          {min: 2, max: 30, pattern: /^\w[\w\d_]*$/, message: '请输入正确的模块名，只能包含大小写字母、数字和下划线，必须以字母开头!!'}
        ],
        jenkinsJob: [
          {type: 'string', required: true, mesage: '请输入Jenkins构建任务名', trigger: 'blur'},
          {min: 2, max: 30, pattern: /^[\w\d_-]*$/, message: '请输入正确的Jenkins Job名称 ：^[\\w\\d_-]*$ '}
        ],
        homeURL: [
          {type: 'string', required: true, message: '请输入仓库的首页URL地址，不是git地址', trigger: 'blur'},
          {min: 10, max: 100, pattern: /^https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/, message: '请输入准确的地址！！'}
        ]
      },
      addModuleLoading: false
    }
  },
  methods: {
    loadModuleList (pageNum) {
      this.listLoading = true
      let form = {pageNum: this.pageNum}
      if (this.selectedType !== '全部') {
        form['type'] = this.selectedType
      }
      if (this.selectMine) {
        form['adminUser'] = this.$store.state.userId
      }
      if (this.searchName.trim() !== '') {
        form['name'] = this.searchName.trim()
      }
      axios.post(`/api/module/list`, form).then(response => {
        this.listLoading = false
        if (response.data.error) {
          console.log(response.data.error)
          return this.$message.error('后台报错 ：' + response.data.error)
        }
        this.pageCount = response.data.pageCount
        this.moduleList = response.data.moduleList
      }).catch((error) => {
        this.listLoading = false
        this.$message.error(error.message)
      })
    },
    submitNewModule () {
      this.$refs['addModuleFrom'].validate((valid) => {
        if (!valid) {
          return
        }
        this.addModuleLoading = true
        axios.post('/api/module/create', this.addModuleInfo).then(res => {
          this.addModuleLoading = false
          if (res.data.error) {
            return this.$message({
              showClose: true,
              message: res.data.error,
              type: 'error',
              duration: 0
            })
          }
          this.addModuleInfo = {
            name: '',
            type: 'iOS',
            jenkinsJob: '',
            homeURL: '',
            gitType: 'gitlab'
          }
          this.$message({
            message: '创建成功， 跳转到该模块页面',
            type: 'success'
          })
          this.addModuleDialogVisible = false
          this.$router.push(`/module-overview/${res.data.moduleId}`)
        }).catch(err => {
          this.addModuleLoading = false
          this.$message({
            showClose: true,
            message: err.message,
            type: 'error',
            diration: 0
          })
        })
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.pageNum = 1
      vm.loadModuleList(1)
    })
  },
  beforeRouteUpdate (to, from, next) {
    next()
    this.pageNum = 1
    this.loadModuleList(1)
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
.option-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  width: 480px;
  justify-content: flex-start
}
.option-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  justify-content: flex-end
}
.label {
  margin-left: 20px;
  margin-right: 10px;
}
.module-table {
  margin-top: 15px;
}
</style>
