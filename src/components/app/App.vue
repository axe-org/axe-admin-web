<template>
  <el-container style="height: 100%;">
    <el-main class="main-container">
      <router-view />
    </el-main>
    <el-aside style="height: 100%;" width="180px">
      <el-table ref="versionList" :data="versionList" v-loading="versionListLoading"
      @current-change="handleCurrentChange" style="width: 100%;" border>
        <el-table-column label="版本" width="180px" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.versionStr }}</span>
            <i v-if="scope.row.versionId === selectVersion.versionId" class="el-icon-success"></i>
          </template>
        </el-table-column>
      </el-table>
      <div class="hmid">
        <el-pagination layout="prev, pager, next" :page-count="pageCount" @current-change="loadVersionList" small/>
        <el-button type="primary" style="margin-top: 20px" size="small" @click="loadVersionList(currentPage)">刷新</el-button>
        <el-button v-if="appAdmin" type="primary" style="margin-top: 20px" size="small">管理模块</el-button>
        <el-button v-if="appAdmin" :disabled="selectedCreateVersion" type="primary" style="margin-top: 10px" size="small" @click="createNewAppVersion">创建版本</el-button>
      </div>
    </el-aside>
  </el-container>
</template>

<script>
import axios from 'axios'
import event from '../../event'
import types from '../../event/types'
// import conf from '../../conf'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      versionList: [
      ],
      selectVersion: {
      },
      currentPage: 1,
      pageCount: 1,
      versionListLoading: false
    }
  },
  computed: {
    ...mapState(['appAdmin']),
    selectedCreateVersion () {
      return this.$route.path === '/app/new'
    }
  },
  name: 'App',
  methods: {
    handleCurrentChange (selected) {
      if (selected) {
        this.selectVersion = selected
        this.$router.push('/app/version/' + this.selectVersion.version)
      }
    },
    createNewAppVersion () {
      this.$router.push('/app/new')
    },
    loadVersionList (pageNum) {
      // 加载时进行刷新
      this.currentPage = pageNum
      this.versionListLoading = true
      // 同时刷新数据。
      axios.get(`/api/app/versions?pageNum=${pageNum}`).then(response => {
        if (response.data.error) {
          this.$message.error(response.data.error)
        } else {
          this.pageCount = response.data.pageCount
          let statusDescribe = ['开发中', '未开始', '已完成']
          response.data.versionList.forEach(versionInfo => {
            versionInfo.versionStr = versionInfo.version + ' (' + statusDescribe[versionInfo.status] + ')'
          })
          this.versionList = response.data.versionList
          if (response.data.versionList.length === 0 && this.$router.currentRoute.fullPath !== '/app/help') {
            // 如果当前没有数据， 则表示没有初始化
            this.$message({
              type: 'info',
              message: '查看帮助，以创建APP版本，开始axe！'
            })
            this.$router.replace('/app/help')
          } else if (!this.selectVersion.versionId && this.versionList.length) {
            // 如果当前没有选中版本，则设定选中当前数据的第一个版本号.
            this.selectVersion = this.versionList[0]
            // 然后进行跳转， 这个跳转为重定向跳转
            this.$router.replace('/app/version/' + this.selectVersion.version)
          }
        }
        this.versionListLoading = false
      }).catch(err => {
        this.$message.error(err.message)
        this.versionListLoading = false
      })
    }
  },
  mounted () {
    this.loadVersionList(1)
    event.$on(types.APP_VERSION_CREATED, (createdVersion) => {
      this.selectVersion = createdVersion
      this.loadVersionList(1)
    })
  }
  // beforeRouteEnter (to, from, next) {
  //   next(vm => {
  //     vm.loadVersionList(vm.currentPage)
  //   })
  // }
}

</script>

<style scoped>
  .main-container {
    width: 100%;
    height: 100%;
    padding-right: 10px;
  }
  a {
  color: #4183C4; }
  a.absent {
    color: #cc0000; }
  a.anchor {
    display: block;
    padding-left: 30px;
    margin-left: -30px;
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0; }
</style>
