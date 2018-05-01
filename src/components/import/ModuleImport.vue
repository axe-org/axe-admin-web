<template>
  <el-tabs style="container" v-model="activeTab" v-loading="loading">
    <el-tab-pane label="管理" class="tabitem" name="manager">
      <import-manager></import-manager>
    </el-tab-pane>
    <el-tab-pane label="记录" class="tabitem" name="record">
      <import-record></import-record>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import ImportManager from './ImportManager'
import ImportRecord from './ImportRecord'
export default {
  name: 'ImportManager',
  components: {
    'import-manager': ImportManager,
    'import-record': ImportRecord
  },
  computed: {

  },
  data () {
    return {
      activeTab: 'manager',
      loading: false
    }
  },
  methods: {

  }
}
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
}
.tabitem {
  height: calc(100vh - 100px);
  width: 100%;
  box-sizing: border-box;
  overflow:auto;
}
</style>
