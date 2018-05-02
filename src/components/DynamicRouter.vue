<template>
  <el-tabs>
    <el-tab-pane label="测试环境">
      <iframe class="frame" frameborder=0 name="showHere" :src="devURL"/>
    </el-tab-pane>
    <el-tab-pane label="生产环境">
      <iframe class="frame" frameborder=0 name="showHere" :src="prdURL"/>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import config from '../conf/config'
export default {
  name: 'DynamicRouter',
  data () {
    return {
      prdURL: config.dynamicRouterAdminServer,
      devURL: `http://${config.devDynamicRouterServerHost}:2679/admin`
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
