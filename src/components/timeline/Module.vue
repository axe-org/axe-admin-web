<template>
  <el-container v-loading="refreshLoading">
    <el-main class="hmid scroll">
      <div>
        <div class="space-between">
          <el-button icon="el-icon-refresh" @click="loadTimelineInfo">刷新</el-button>
          <el-button v-if="canAddAction" icon="el-icon-plus" @click="addActionDialogVisable = true">新增</el-button>
        </div>
        <timeline style="margin-top: 20px;" :actionList="actionList" :showToday="inProgress" @click="selectAction"/>
      </div>
    </el-main>
    <el-aside style="height: 100%;" width="240px">
      <div class="hmid">
        <el-form status-icon label-width="80px" style="width: 100%;" size="mini">
          <!-- <el-form-item label="APP版本">
            <div>{{ appVersion }}</div>
          </el-form-item>
          <el-form-item label="创建时间">
            <div>{{ versionCreatedTime }}</div>
          </el-form-item>
          <el-form-item label="当前状态">
            <div>{{ appState }}</div>
          </el-form-item> -->
        </el-form>
        <el-form v-if="selectedAction" status-icon label-width="80px" style="width: 100%;">
          <el-form-item label="-事件详情-">
          </el-form-item>
          <el-form-item label="事件标题">
            <div>{{ selectedAction.title }}</div>
          </el-form-item>
          <el-form-item label="预定时间">
            <div>{{ selectedAction.expectedTimeString }}</div>
          </el-form-item>
          <el-form-item v-if="actionFinished" label="完成时间">
            <div>{{ selectedAction.finishedTimeString }}</div>
          </el-form-item>
          <el-form-item label="当前状态">
            <div>{{ selectedAction.status ? "已完成" : "未完成" }}</div>
          </el-form-item>
          <el-form-item label="详细描述">
            <div class="desc" v-html="selectedAction.detail"></div>
          </el-form-item>
          <el-form-item v-if="canAddDesc">
            <el-button type="primary" @click="addDescDialogVisable = true">修改描述</el-button>
          </el-form-item>
          <el-form-item v-if="canDelete">
            <el-button type="danger" @click="deleteActionDialogVisable = true">删除事件</el-button>
          </el-form-item>
          <el-form-item v-if="canFinsh">
            <el-button type="success" @click="showFinishDialog">完成事件</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-aside>
    <el-dialog title="添加计划" :visible.sync="addActionDialogVisable" center width='500px' v-loading="addActionLoading">
      <el-form :model="addActionForm" ref="addActionForm" :rules="addActionRules" label-width="80px">
        <el-form-item label="事件标题" prop="title">
          <el-input v-model="addActionForm.title" placeholder="事件标题，概要描述任务" :maxlength='25'></el-input>
        </el-form-item>
        <el-form-item label="完成时间" prop="time">
          <el-date-picker v-model="addActionForm.time" type="date" placeholder="选择日期"/>
        </el-form-item>
        <el-form-item label="详细描述" prop="detail">
          <el-input type="textarea" :rows="3" placeholder="请输入详细描述，以及具体实施中出现的问题或者附加的说明。" v-model="addActionForm.detail" :maxlength='250'></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addActionDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addAction">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改描述" :visible.sync="addDescDialogVisable" center width='500px' v-loading="addDescLoading">
      <el-form :model="addDescForm" ref="addDescForm" :rules="addDescRules" label-width="80px">
        <el-form-item label="事件标题">
          <div>{{ selectedAction ? selectedAction.title : "" }}</div>
        </el-form-item>
        <el-form-item label="详细描述" prop="detail">
          <el-input type="textarea" :rows="3" v-model="addDescForm.detail" :maxlength='250'></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDescDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="addDesc">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="删除事件" :visible.sync="deleteActionDialogVisable" center width='500px' v-loading="deleteActionLoading">
      <div style="font-size: 20px;color: red;">确认删除事件 "{{ selectedAction ? selectedAction.title : "" }}" ？ ！ </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteActionDialogVisable = false">取 消</el-button>
        <el-button type="danger" @click="deleteAction">删 除</el-button>
      </div>
    </el-dialog>
    <el-dialog title="完成事件" :visible.sync="finishActionDialogVisable" center width='500px' v-loading="finishActionLoading">
      <el-form :model="finishActionForm" ref="finishActionForm" :rules="finishActionRules" label-width="80px">
        <el-form-item label="事件标题">
          <div>{{ selectedAction ? selectedAction.title : "" }}</div>
        </el-form-item>
        <el-form-item label="预定时间">
          <div>{{ selectedAction ? selectedAction.expectedTimeString : "" }}</div>
        </el-form-item>
        <el-form-item label="当前时间">
          <div>{{ selectedAction ? finishActionForm.time : "" }}</div>
        </el-form-item>
        <el-form-item label="详细描述" prop="detail">
          <el-input type="textarea" :rows="3" v-model="finishActionForm.detail" :maxlength='250'></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="finishActionDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="finishAction">确 定</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import axios from 'axios'
import conf from '../../conf'
import dateformat from 'dateformat'
export default {
  name: 'ModuleTimeline',
  props: {
    moduleLineId: Number,
    moduleAdmin: Boolean
    // appVersion: String
  },
  data () {
    return {
      lineId: this.moduleLineId,
      refreshLoading: false,
      // appState: '',
      inProgress: false,
      moduleId: '',
      timelineInfo: {

      },
      appTimelineInfo: {

      },
      actionList: [],
      selectedAction: undefined,
      addActionDialogVisable: false,
      addActionLoading: false,
      addActionForm: {
        title: '',
        time: '',
        detail: ''
      },
      addActionRules: {
        title: [
          { type: 'string', required: true, message: '请输入标题', trigger: 'blur' },
          { min: 2, max: 25, message: '标题长度 2 - 25', trigger: 'blur' }
        ],
        detail: [
          { type: 'string', required: true, message: '请输入描述', trigger: 'blur' },
          { min: 2, max: 250, message: '描述不能超过250个字符串！', trigger: 'blur' }
        ],
        time: [
          { type: 'date', required: true, message: '请设置预计完成时间', trigger: 'change' }
        ]
      },
      addDescDialogVisable: false,
      addDescLoading: false,
      addDescForm: {
        detail: ''
      },
      addDescRules: {
        detail: [
          { type: 'string', required: true, message: '请输入描述', trigger: 'blur' },
          { min: 2, max: 250, message: '描述不能超过250个字符串！', trigger: 'blur' }
        ]
      },
      deleteActionDialogVisable: false,
      deleteActionLoading: false,
      finishActionDialogVisable: false,
      finishActionLoading: false,
      finishActionForm: {
        detail: '',
        time: ''
      },
      finishActionRules: {
        detail: [
          { type: 'string', required: true, message: '请输入描述', trigger: 'blur' },
          { min: 2, max: 250, message: '描述不能超过250个字符串！', trigger: 'blur' }
        ]
      },
      firstUnfinshedActionId: 0 // 用于检测事件是否可以完成， 事件需要按序完成。
    }
  },
  computed: {
    canAddAction () {
      return this.moduleAdmin && this.timelineInfo && this.timelineInfo.timelineInfo &&
       this.timelineInfo.timelineInfo.status !== conf.TIMELINE_STATUS_DONE
    },
    actionFinished () {
      return this.selectedAction && this.selectedAction.right && this.selectedAction.status === conf.TIMELINE_ACTION_STATUS_FINISHED
    },
    canAddDesc () {
      return this.moduleAdmin && this.selectedAction && this.selectedAction.right &&
       this.selectedAction.status !== conf.TIMELINE_ACTION_STATUS_FINISHED
    },
    canDelete () {
      return this.moduleAdmin && this.selectedAction && this.selectedAction.right &&
       this.selectedAction.status !== conf.TIMELINE_ACTION_STATUS_FINISHED &&
        this.selectedAction.type === conf.TIMELINE_ACTION_TYPE_USERSET
    },
    canFinsh () {
      return this.moduleAdmin && this.selectedAction && this.selectedAction.right &&
       this.selectedAction.status !== conf.TIMELINE_ACTION_STATUS_FINISHED &&
       this.firstUnfinshedActionId === this.selectedAction.actionId
    }
  },
  methods: {
    loadTimelineInfo () {
      this.refreshLoading = true
      axios.post(`/api/timeline/info`, {
        lineId: this.moduleLineId
      }).then(response => {
        this.refreshLoading = false
        if (response.data.error) {
          return this.$message({
            showClose: true,
            message: response.data.error,
            type: 'error',
            duration: 0
          })
        }
        this.selectedAction = undefined // 设置选中为空
        // this.versionCreatedTime = response.data.appVersionInfo.createdTime
        // let appStatusTypes = ['开发中', '未开始', '已完成']
        // this.appState = appStatusTypes[response.data.appVersionInfo.status]
        if (response.data.moduleVersionInfo.status === conf.TIMELINE_STATUS_DOING) {
          this.inProgress = true
        } else {
          this.inProgress = false
        }
        // let finishedActionCount = 0
        let recordUnfinishedAction = false
        let actionList = []
        response.data.actionList.forEach(action => {
          // 将时间格式化为 Date类型
          action.expectedTimeString = action.expectedTime
          action.expectedTime = new Date(action.expectedTime.replace(/-/g, '/'))
          action.year = action.expectedTime.getFullYear()
          action.date = (action.expectedTime.getMonth() + 1) + '/' + action.expectedTime.getDate()
          if (action.status === conf.TIMELINE_ACTION_STATUS_FINISHED) {
            action.finished = true
            // finishedActionCount++
            // 已完成，则设置时间是完成时间
            action.finishedTimeString = action.finishedTime
            action.finishedTime = new Date(action.finishedTime.replace(/-/g, '/'))
          } else {
            if (recordUnfinishedAction === false) {
              this.firstUnfinshedActionId = action.actionId
              recordUnfinishedAction = true
            }
            action.finished = false
            action.finishedTimeString = ''
          }
          // 这里， 所有模块的事件放在右边
          action.right = true
          action.message = action.detail
          actionList.push(action)
        })
        // 同时显示app事件，只显示标准事件，放左边。
        response.data.appTimelineInfo.actionList.forEach(action => {
          // 将时间格式化为 Date类型
          action.expectedTimeString = action.expectedTime
          action.expectedTime = new Date(action.expectedTime.replace(/-/g, '/'))
          action.year = action.expectedTime.getFullYear()
          action.date = (action.expectedTime.getMonth() + 1) + '/' + action.expectedTime.getDate()
          if (action.status === conf.TIMELINE_ACTION_STATUS_FINISHED) {
            action.finished = true
            // 已完成，则设置时间是完成时间
            action.finishedTimeString = action.finishedTime
            action.finishedTime = new Date(action.finishedTime.replace(/-/g, '/'))
          } else {
            action.finished = false
            action.finishedTimeString = ''
          }
          // APP 事件放左边
          action.right = false
          action.message = action.detail
          if (action.type !== conf.TIMELINE_ACTION_TYPE_USERSET) {
            actionList.push(action)
          }
        })
        actionList.sort((a, b) => {
          return a.expectedTime > b.expectedTime
        })
        this.actionList = actionList
        // this.appProgress = finishedActionCount + ' / ' + response.data.actionList.length
        this.appTimelineInfo = response.data.appTimelineInfo
        this.timelineInfo = response.data
        this.moduleId = response.data.moduleVersionInfo.moduleId
        this.refreshLoading = false
      }).catch(err => {
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
        this.refreshLoading = false
      })
    },
    selectAction (action) {
      this.selectedAction = action
      // 再次将 <br> 改回 \n 。
      let reformat = action.detail.replace(/<br>/g, '\n')
      reformat = reformat.replace(/&lt;/g, '<')
      reformat = reformat.replace(/&gt;/g, '>')
      this.addDescForm.detail = reformat
    },
    addAction () {
      this.$refs['addActionForm'].validate((valid) => {
        if (valid) {
          // 先检测一下事件时间， 不能超过开始和结束时间。
          let startDate = this.timelineInfo.actionList[0].expectedTime
          let endDate = this.timelineInfo.actionList[this.timelineInfo.actionList.length - 1].expectedTime
          if (this.addActionForm.time <= startDate) {
            return this.$message({
              showClose: true,
              message: '创建的自定义事件，应该在项目开始时间之后！！',
              type: 'error',
              duration: 0
            })
          } else if (this.addActionForm.time >= endDate) {
            return this.$message({
              showClose: true,
              message: '创建的自定义事件，应该在项目结束时间之前！！',
              type: 'error',
              duration: 0
            })
          }
          // 提交
          this.addActionLoading = true
          // 提交时，将换行符进行转换。
          let format = this.addActionForm.detail.replace(/</g, '&lt;')
          format = format.replace(/>/g, '&gt;')
          format = format.replace(/\n/g, '<br>')
          axios.post('/api/timeline/add', {
            lineId: this.lineId,
            expectedTime: this.addActionForm.time,
            title: this.addActionForm.title,
            detail: format,
            moduleId: this.moduleId
          }).then((response) => {
            this.addActionLoading = false
            if (response.data.error) {
              this.$message({
                showClose: true,
                message: response.data.error,
                type: 'error',
                duration: 0
              })
            } else {
              this.$message({
                type: 'info',
                message: '创建成功！'
              })
              this.addActionDialogVisable = false
              this.addActionForm = {
                title: '',
                time: '',
                detail: ''
              }
              // 同时，刷新当前页面信息。
              this.loadTimelineInfo()
            }
          }).catch(err => {
            this.$message({
              showClose: true,
              message: err.message,
              type: 'error',
              duration: 0
            })
            this.addActionLoading = false
          })
        }
      })
    },
    addDesc () {
      this.$refs['addDescForm'].validate((valid) => {
        if (valid) {
          // 提交
          this.addDescLoading = true
          // 提交时，将换行符进行转换。
          let format = this.addDescForm.detail.replace(/</g, '&lt;')
          format = format.replace(/>/g, '&gt;')
          format = format.replace(/\n/g, '<br>')
          axios.post('/api/timeline/addDetail', {
            lineId: this.lineId,
            actionId: this.selectedAction.actionId,
            detail: format,
            moduleId: this.moduleId
          }).then((response) => {
            this.addDescLoading = false
            if (response.data.error) {
              this.$message({
                showClose: true,
                message: response.data.error,
                type: 'error',
                duration: 0
              })
            } else {
              this.$message({
                type: 'info',
                message: '修改成功！'
              })
              this.addDescDialogVisable = false
              this.addDescForm = {
                title: ''
              }
              // 同时，刷新当前页面信息。
              this.loadTimelineInfo()
            }
          }).catch(err => {
            this.$message({
              showClose: true,
              message: err.message,
              type: 'error',
              duration: 0
            })
            this.addDescLoading = false
          })
        }
      })
    },
    deleteAction () {
      // 提交
      this.deleteActionLoading = true
      // 提交时，将换行符进行转换。
      axios.post('/api/timeline/delete', {
        lineId: this.lineId,
        actionId: this.selectedAction.actionId,
        moduleId: this.moduleId
      }).then((response) => {
        this.deleteActionLoading = false
        if (response.data.error) {
          this.$message({
            showClose: true,
            message: response.data.error,
            type: 'error',
            duration: 0
          })
        } else {
          this.$message({
            type: 'info',
            message: '删除成功！'
          })
          this.deleteActionDialogVisable = false
          // 同时，刷新当前页面信息。
          this.loadTimelineInfo()
        }
      }).catch(err => {
        this.$message({
          showClose: true,
          message: err.message,
          type: 'error',
          duration: 0
        })
        this.deleteActionLoading = false
      })
    },
    showFinishDialog () {
      let reformat = this.selectedAction.detail.replace(/<br>/g, '\n')
      reformat = reformat.replace(/&lt;/g, '<')
      reformat = reformat.replace(/&gt;/g, '>')
      this.finishActionForm.time = dateformat('yyyy-mm-dd')
      this.finishActionForm.detail = reformat + '\n由 ' + this.$store.state.userName + ' 完成于 ' + this.finishActionForm.time
      this.finishActionDialogVisable = true
    },
    finishAction () {
      this.$refs['finishActionForm'].validate((valid) => {
        if (valid) {
          // 提交
          this.finishActionLoading = true
          // 提交时，将换行符进行转换。
          let format = this.finishActionForm.detail.replace(/</g, '&lt;')
          format = format.replace(/>/g, '&gt;')
          format = format.replace(/\n/g, '<br>')
          axios.post('/api/timeline/finish', {
            lineId: this.lineId,
            actionId: this.selectedAction.actionId,
            detail: format,
            moduleId: this.moduleId
          }).then((response) => {
            this.finishActionLoading = false
            if (response.data.error) {
              this.$message({
                showClose: true,
                message: response.data.error,
                type: 'error',
                duration: 0
              })
            } else {
              this.$message({
                type: 'info',
                message: '完成事件！'
              })
              this.finishActionDialogVisable = false
              this.finishActionForm = {
                title: '',
                time: ''
              }
              // 同时，刷新当前页面信息。
              this.loadTimelineInfo()
              // 对于完成事件， 发送通知，以通知外部刷新界面
              this.$emit('refresh')
            }
          }).catch(err => {
            this.$message({
              showClose: true,
              message: err.message,
              type: 'error',
              duration: 0
            })
            this.finishActionLoading = false
          })
        }
      })
    }
  },
  mounted () {
    // 初始化以及加载数据
    this.loadTimelineInfo()
  }
}
</script>

<style scoped>
  .scroll {
    height: calc(100vh - 90px);
    box-sizing: border-box;
    overflow: auto;
  }
  .desc {
    margin-top: 9px;
    line-height:20px;
    font-size: 12.5px;
  }
</style>
