<template>
  <div class="hello body">
    <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <el-button @click="visible = true">Button</el-button>
    <el-dialog :visible.sync="visible" title="Hello world">
      <p>Try Element</p>
    </el-dialog>

    <h2 id="toc_0">hello world</h2>

    <div><pre><code class="language-none">hello world</code></pre></div>

    <ul>
    <li><p>zheli</p></li>
    </ul>

    <ol>
    <li>哪里</li>
    </ol>

  </div>
</template>

<script>
// import '../assets/markdown.css'
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      visible: false
    }
  },
  beforeRouteEnter (to, from, next) {
    console.log('beforeRouteEnter')
    next(vm => {
      // 通过 `vm` 访问组件实例
      console.log('beforeRouteEnter' + vm)
    })
  },
  beforeRouteUpdate (to, from, next) {
    console.log('beforeRouteUpdate')
    next()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  @import '../assets/markdown.css';
</style>
