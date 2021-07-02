const db = wx.cloud.database()
 
// 获取全部数据
 let _findByWhere = async(collectionName,where={})=>{
   const countResult = await db.collection(collectionName).count()
   const total = countResult.total
   const MAX_LIMIT = 20
   const batchTimes = Math.ceil(total / MAX_LIMIT)
   const tasks = []
   for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(collectionName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let resuts = await Promise.all(tasks);
  if (resuts.length <= 0) return { data: null }
  return resuts.reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),

    }
  })
 }
//  分页查询
 let findbypage = (collectionName,where = {},limit = 4,page = 1,sort = { field: "_id", order: "desc" })=>{
   let skip =( page-1)*limit
   return db.collection(collectionName).where(where).skip(skip).orderBy(sort.field,sort.order).limit(limit).get()
 }
//  根据id查询
let findid = (collectionName,id)=>{
  return db.collection(collectionName).doc(id).get()
}
// 添加
 let _add = (collectionName, data = {}) => {
  return db.collection(collectionName).add({ data })
}
// 修改
let _updatae = (collectionName, id, data)=>{
 return db.collection(collectionName).doc(id).update({
  data
 })
}
// 删除
let _del = (collectionName,id)=>{
  return db.collection(collectionName).doc(id).remove()
}
// 条件删除
let whweredel = (collectionName,data)=>{
  return db.collection(collectionName).where(data).remove()
}



export default{
  // 添加
  _add,
  // 条件查询
  _findByWhere,
  // 更改
  _updatae,
  // 删除
  _del,
  // 分页查询
  findbypage,
  // id查询
  findid,
  whweredel
}