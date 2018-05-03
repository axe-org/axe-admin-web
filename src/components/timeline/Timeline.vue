<template>
  <div class="section">
    <div v-for="action in actions" :key="action.actionId" class="article">
      <div v-if="action.today">
        <span class="today">
          <span>{{ todayDate }}</span>
          <span>Today</span>
          <span>{{ todayYear }}</span>
        </span>
      </div>
      <div class="line">
        <div class="action" :class="{ 'action-right': action.right }" @click="clickAction(action)">
          <div class="title" :class="{ finished: action.finished }">{{ action.title }}</div>
          <div class="message" v-html="action.message"></div>
        </div>
        <span class="date">
          <span>{{ action.date }}</span>
          <span>{{ action.year }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Timeline',
  props: {
    actionList: {// 传入的列表是已经排序的
      type: Array,
      default: function () {
        return []
      }
    },
    showToday: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      todayDate: '',
      todayYear: '',
      actions: []
    }
  },
  watch: {
    actionList: function (newlist) {
      // TODO ， 这里的 today处理还是有问题
      let actions = newlist.concat()
      if (this.showToday) {
        let today = new Date()
        this.todayYear = today.getFullYear()
        this.todayDate = (today.getMonth() + 1) + '/' + today.getDate()
        actions.forEach(action => {
          let setDate = new Date(action.year + '/' + action.date)
          if (today && setDate > today) {
            action.today = true
            today = false
          }
        })
      }
      this.actions = actions
    }
  },
  methods: {
    clickAction (action) {
      this.$emit('click', action)
    }
  }
}
</script>

<style scoped>
  .section {
    margin: 0;
    padding: 0;
    position: relative;
    font-family: Helvetica, sans-serif;
  }
  .section:before {
    content: '';
    display: block;
    position: absolute;
    left: 50%;
    top: 0;
    margin: 0 0 0 -1px;
    width: 2px;
    height: 100%;
    background: #25303b77;
  }
  .line {
    top: 0px;
    left: 0px;
    right: 0px;
    width: 100%;
    position: relative;
    display: block;
    background-color: rgb(202, 34, 34);
  }
  .article {
    width: 100%;
    margin: 0 0 20px 0;
    position: relative;
  }
  .article:after {
    content: '';
    display: block;
    clear: both;
  }
  .action {
    width: 42%;
    float: left;
    margin: 5px 0 0 0;
    border-radius: 6px;
  }
  .action-right {
    float: right;
  }
  .date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 40px;
    padding: 5px 0;
    position: absolute;
    top: 0;
    left: 50%;
    margin: 0 0 0 -25px;
    border-radius: 100%;
    font-size: 13px;
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    background: rgb(86, 61, 124);
    color: rgb(255, 248, 248);
    border: 2px solid rgba(255, 255, 255, 0.493);
    /* box-shadow: 0 0 0 4px #25303B; */
  }
  .today {
    clear: both;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 50px;
    padding: 6px 0;
    position: relative;
    top: 100;
    left: 50%;
    margin-left: -30px;
    margin-bottom: 20px;
    border-radius: 100%;
    font-size: 13px;
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    background: rgb(240, 219, 79);
    color: rgb(0, 0, 0);
    border: 2px solid rgba(255, 255, 255, 0.493);
    /* box-shadow: 0 0 0 4px #25303B; */
  }
  .title {
    padding: 10px;
    margin: 0;
    color: #fff;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: -1px;
    border-radius: 6px 6px 0 0;
    position: relative;
  }
  .finished {
    text-decoration: line-through;
  }
  .title:after {
    content: '';
    position: absolute;
    top: 20px;
    right: -5px;
    width: 10px;
    height: 10px;
    transform:rotate(-45deg);
    -ms-transform:rotate(-45deg);
    -moz-transform:rotate(-45deg);
    -webkit-transform:rotate(-45deg);
    -o-transform:rotate(-45deg);
  }
  .action-right .title:after {
    left: -5px;
  }
  .message {
    padding: 15px;
    margin: 0;
    font-size: 14px;
    background: rgb(245, 245, 245);
    color: #656565;
    border-radius: 0 0 6px 6px;
  }
  .section .article:nth-child(5n + 1)  .action .title {
    background: #e74c3c;
  }
  .section .article:nth-child(5n + 1)  .action .title:after {
    background: #e74c3c;
  }
  .section .article:nth-child(5n + 2)  .action .title {
    background: #2ecc71;
  }
  .section .article:nth-child(5n + 2)  .action .title:after {
    background: #2ecc71;
  }
  .section .article:nth-child(5n + 3)  .action .title {
    background: #e67e22;
  }
  .section .article:nth-child(5n + 3)  .action .title:after {
    background: #e67e22;
  }
  .section .article:nth-child(5n + 4)  .action .title {
    background: #1abc9c;
  }
  .section .article:nth-child(5n + 4)  .action .title:after {
    background: #1abc9c;
  }
  .section .article:nth-child(5n + 5)  .action .title {
    background: #9b59b6;
  }
  .section .article:nth-child(5n + 5)  .action .title:after {
    background: #9b59b6;
  }
</style>
