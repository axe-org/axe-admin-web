<template>
  <div class="body" ref="mdContainer" v-html="html"></div>
</template>

<script>
// import VueMarkdown from 'vue-markdown'
import md from './markdown/index.md'
import marked from 'marked'

export default {
  name: 'appDocs',
  data () {
    return {
      html: ''
    }
  },
  created () {
    this.html = marked(md)
  }
}
</script>

<style>
  @import '../../assets/markdown.css';
</style>
