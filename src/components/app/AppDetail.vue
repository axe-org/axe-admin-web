<template>
  <div class="hello body" v-loading="refreshLoading">
    <h1>{{ version }}</h1>
    <el-button type="primary" style="margin-top: 20px" size="small" @click="showTimeLine">详细时间线</el-button>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'HelloWorld',
  data () {
    return {
      version: '',
      refreshLoading: false,
      versionInfo: {

      }
    }
  },
  methods: {
    showTimeLine () {
      this.$router.push('/apptimeline/' + this.versionInfo.timelineId)
    },
    loadVersionInfo () {
      document.title = this.version
      this.refreshLoading = true
      axios.get(`/api/app/version?version=${this.version}`).then(response => {
        if (response.data.error) {
          this.$message({
            showClose: true,
            message: response.data.error,
            type: 'error',
            duration: 0
          })
        } else {
          this.versionInfo = response.data
          this.refreshLoading = false
        }
      }).catch(err => {
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
        this.refreshLoading = false
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.version = to.params.version
      vm.loadVersionInfo()
    })
  },
  beforeRouteUpdate (to, from, next) {
    next()
    this.version = to.params.version
    this.loadVersionInfo()
  }
}
</script>

<style scoped>

</style>
