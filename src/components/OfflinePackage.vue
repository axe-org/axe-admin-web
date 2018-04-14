<template>
  <el-tabs type="border-card" style="margin-top:-20px">
    <el-tab-pane label="测试环境">
      <iframe class="frame" frameborder=0 name="showHere" src="http://localhost:2677/admin/"/>
    </el-tab-pane>
    <el-tab-pane label="生产环境">
      <iframe class="frame" frameborder=0 name="showHere" src="/api/offlinePack/"/>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      visible: false
    }
  }
}
</script>
<style scoped>
  .frame {
    margin-top: -40px;
    width: 900px;
    height: 700px;
  }
</style>
