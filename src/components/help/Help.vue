<template>
  <el-container style="height: 100%;">
    <el-main class="main-container">
      <router-view/>
    </el-main>
    <el-aside style="height: 100%;" width="160px">
      <el-menu :default-active="activeRouter" style="border-right:0px;border-left:1px solid #cccccc;height: 100%;margin-left:20px;" :router="true">
        <el-menu-item index="/help/index">
          <a slot="title">index</a>
        </el-menu-item>
        <el-menu-item index="/help/app">
          <a slot="title">APP 介绍</a>
        </el-menu-item>
      </el-menu>
    </el-aside>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      activeRouter: '/help/index'
    }
  },
  name: 'Help'
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
