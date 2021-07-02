let mytables={
  table_user:"a-users",//用户登录表
  // 管理员id
  userid:"oj-5E5deKrsFUwirndUw4ZvefjhM",
  // 分类表
  typename:"a-typename",
  // 菜品数据
  datalist:"a-datalist",
  follow:"a-follow"
}
const db = wx.cloud.database()

export default {
  mytables,
  db
}