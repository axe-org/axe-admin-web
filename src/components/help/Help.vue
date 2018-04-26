<template>
  <el-tabs tab-position="right" style="width: 100%; height: 100%;">
    <el-tab-pane v-for="item in docs" :label="item.title" :key="item.title">
      <div style="width: 100%;height: 100vh;overflow:auto;">
        <markdown class="body" :content="item.content"/>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import AppContent from './markdown/app.md'
import HelpContent from './markdown/index.md'
import Markdown from '../Markdown'
export default {
  components: {
    'markdown': Markdown
  },
  data () {
    return {
      docs: []
    }
  },
  name: 'Help',
  created () {
    let docs = []
    docs.push({
      title: '概览',
      content: HelpContent
    })
    docs.push({
      title: 'APP介绍',
      content: AppContent
    })

    this.docs = docs
  }
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
@media screen and (min-width: 914px) {
  .body {
    width: 764px;
    margin:0 auto;
  }
}
</style>
