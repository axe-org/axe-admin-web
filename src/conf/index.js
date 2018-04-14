export default Object.freeze({
  TIMELINE_STATUS_WAITING: 1,
  TIMELINE_STATUS_DOING: 0,
  TIMELINE_STATUS_DONE: 2,
  TIMELINE_TYPE_APP: 0,
  TIMELINE_TYPE_MODULE: 1,
  TIMELINE_ACTION_STATUS_UNFINISHED: 0,
  TIMELINE_ACTION_STATUS_FINISHED: 1,
  TIMELINE_ACTION_TYPE_USERSET: 0,
  TIMELINE_ACTION_TYPE_START: 1, // 开始
  TIMELINE_ACTION_TYPE_DEVELOP_FINISHED: 2, // 开发完成
  TIMELINE_ACTION_TYPE_TEST_FINISHED: 3, // 测试完成
  TIMELINE_ACTION_TYPE_SUBMIT: 4, // 对于APP是提交审核，对于模块是提交到APP
  TIMELINE_ACTION_TYPE_FINISH: 5 // 对于APP是 审核完成与其他处理彻底完成， 而对于模块是打prd版本。
})
