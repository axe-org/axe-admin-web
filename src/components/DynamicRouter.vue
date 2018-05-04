<template>
  <iframe v-if="guestMode" style="width: 100%; height: calc(100% - 10px);" frameborder=0 :src="prdURL"/>
  <el-tabs v-else>
    <el-tab-pane label="测试环境">
      <iframe class="frame" frameborder=0 :src="devURL"/>
    </el-tab-pane>
    <el-tab-pane label="生产环境">
      <iframe class="frame" frameborder=0 :src="prdURL"/>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import config from '../conf/config'
export default {
  name: 'DynamicRouter',
  data () {
    return {
      prdURL: config.dynamicRouterAdminURL,
      devURL: config.devDynamicRouterAdminURL,
      guestMode: config.guestMode
    }
  }
}
</script>
<style scoped>
.frame {
  width: 100%;
  height: calc(100vh - 100px);
}
</style>
