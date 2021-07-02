// 云函数入口文件

const cloud = require('wx-server-sdk')


cloud.init({
  env: 'demo2-9gh60jwy568d0a39'
})
let db = cloud.database({
  env: 'demo2-9gh60jwy568d0a39'
})
// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  let {collectionName,where} = event
  let rst = await db.collection(collectionName).where(where).remove()
  return rst;
}