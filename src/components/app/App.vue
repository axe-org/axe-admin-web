<template>
  <el-tabs style="margin-top: -10px;" type="card" @tab-remove="removeTab" v-model="selectedTab">
    <el-tab-pane label="版本列表" name="main">
      <versionlist ref="versionList" class="mainview" @open="handleOpen"/>
    </el-tab-pane>
    <el-tab-pane closable v-for="item in tabList"
      :key="item.title" :label="item.title" :name="item.title">
      <app-timeline class="mainview" v-if="item.type ==='timeline'" :line-id="item.data.lineId"/>
      <app-detail @open="handleOpen" @delete="handleVersionDelete" class="mainview" v-if="item.type === 'detail'" :version="item.data.version"/>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import VersionList from './VersionList'
import APPTimeline from '../timeline/App'
import APPDetail from './DetailInfo'

export default {
  components: {
    'versionlist': VersionList,
    'app-timeline': APPTimeline,
    'app-detail': APPDetail
  },
  data () {
    return {
      selectedTab: 'main',
      tabList: [] // {title: 标题 唯一: ,type ：类型 , data: {数据}}
    }
  },
  name: 'App',
  methods: {
    handleVersionDelete () {
      if (this.selectedTab !== 'main') {
        this.removeTab(this.selectedTab)
      }
      this.$refs['versionList'].loadVersionList()
    },
    handleOpen (option) {
      // 先检查本地是否有相应的页面.
      for (let tab of this.tabList) {
        if (tab.title === option.title) {
          this.selectedTab = option.title
          return
        }
      }
      this.tabList.push(option)
      this.selectedTab = option.title
    },
    removeTab (name) {
      this.selectedTab = 'main'
      this.tabList = this.tabList.filter(tab => tab.title !== name)
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (to.query.version) {
        // 如果要跳转到指定版本
        vm.handleOpen({
          title: to.query.version,
          type: 'detail',
          data: {
            version: to.query.version
          }
        })
      }
    })
  }
}

</script>

<style scoped>
.mainview {
  height: calc(100vh - 90px);
  width: 100%;
  box-sizing: border-box;
  overflow: auto;
}
</style>
