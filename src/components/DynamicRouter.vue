<template>
  <iframe v-if="guestMode" style="width: 100%; height: calc(100% - 10px);" frameborder=0 :src="dynamicRouterAdminURL"/>
  <el-tabs v-else>
    <el-tab-pane label="测试环境">
      <iframe class="frame" frameborder=0 :src="devDynamicRouterAdminURL"/>
    </el-tab-pane>
    <el-tab-pane label="生产环境">
      <iframe class="frame" frameborder=0 :src="dynamicRouterAdminURL"/>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import config from '../conf/config'
import { mapState } from 'vuex'
export default {
  name: 'DynamicRouter',
  data () {
    return {
      devDynamicRouterAdminURL: config.devDynamicRouterAdminURL,
      guestMode: config.guestMode
    }
  },
  computed: {
    ...mapState(['dynamicRouterAdminURL'])
  }
}
</script>
<style scoped>
.frame {
  width: 100%;
  height: calc(100vh - 100px);
}
</style>
