<template>
  <div class="body" ref="mdContainer" v-html="html"></div>
</template>

<script>
import marked from 'marked'

export default {
  name: 'markdown',
  data () {
    return {
    }
  },
  props: {
    content: {
      type: String
    }
  },
  computed: {
    html () {
      return marked(this.content)
    }
  }
}
</script>

<style scoped>
  @import '../assets/markdown.css';
</style>
