<template>
  <iframe v-if="guestMode" style="width: 100%;height: calc(100% - 10px); margin-top: -20px;" frameborder=0 :src="offlinePackAdminURL"/>
  <el-tabs v-else>
    <el-tab-pane label="测试环境">
      <iframe class="frame" frameborder=0 :src="devOfflinePackAdminURL"/>
    </el-tab-pane>
    <el-tab-pane label="生产环境">
      <iframe class="frame" frameborder=0 :src="offlinePackAdminURL"/>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import config from '../conf/config'
import { mapState } from 'vuex'
export default {
  name: 'OfflinePackage',
  data () {
    return {
      devOfflinePackAdminURL: config.devOfflinePackAdminURL,
      guestMode: config.guestMode
    }
  },
  computed: {
    ...mapState(['offlinePackAdminURL'])
  }
}
</script>
<style scoped>
.frame {
  margin-top: -20px;
  width: 100%;
  height: calc(100vh - 100px);
}
</style>
