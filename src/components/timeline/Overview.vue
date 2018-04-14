<template>
  <div class="hello body">
    <h2>当前timeline信息概览！！！</h2>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
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
<style scoped>
</style>
