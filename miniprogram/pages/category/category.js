// pages/category/category.js
import api from "../../utils/api"
import global from "../../utils/gloab"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 添加的input
    myinput:"",
    // 渲染的数据
    typeinput:[],
    // 修改的input
    updateinput:'',
    _id:'',
    switch:true,//判断是否添加到首页
    switch1:false,
    // 是否添加到首页按钮
    isflag:true,
    isflag2:false,
    files:[],// 图片集合
    files2:[]// 图片集合
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getinput()
  },
  // 获取数据
  async getinput(){
    let data = await api._findByWhere(global.mytables.typename)
    // console.log(data.data);
    this.setData({
      typeinput:data.data
    })
  },
  // 判断是否添加到首页
  switch(e){
    let switchif = e.detail.value
    console.log(switchif);
  },
  // 添加新类名
 async _add(){
  //  获取input值
    let myinput = this.data.myinput
    let isflag= this.data.isflag
    // console.log(myinput);
    // 判断input值是否为空
    if(myinput==""){
      wx.showToast({
        title: '请不要输入空内容',
        icon:"none"
      })
      return
    } 
    if(files==""){
      wx.showToast({
        title: '请选择logo',
        icon:"none"
      })
      return
    } 
    if (myinput == '') return
    // 判断 新增类名是否已存在
    if(this.data.typeinput==null) return
    if(this.data.typeinput != ""){
      let index = this.data.typeinput.findIndex(item=>item.myinput == myinput)
      // console.log(index);
      if(index != -1){
        wx.showToast({
          title: '菜谱分类已存在',
          icon:"none"
        })
        return
      }
    }
    // 上传云端
    let files = await this.uploadImage()
    this.setData({
      files:[]
    })
    // console.log(files);
    // 添加分类
    let rst = await api._add(global.mytables.typename,{myinput,isflag,files})
    // console.log(rst);
    if(rst._id){
      wx.showToast({
        title: '新增分类成功',
        icon:"none"
      })
    }
    // 刷新页面
    this.setData({
      myinput:"",
    })
    this.getinput()
  },
  // 修改类名
  _clickup(e){
    let {id,name} = e.currentTarget.dataset
    this.setData({
      updateinput:name,
      _id:id
    })
  },
  async _update(){
    // 获取更改后的数据
    let {updateinput,_id} = this.data
    let myinput = this.data.updateinput
    let isflag = this.data.isflag2
    // 如果设置为空 提醒
    if(updateinput==""){
      wx.showToast({
        title: '请不要输入空内容',
        icon:"none"
      })
      return
    } 
    // 更新修改后的值
    let data = await api._updatae(global.mytables.typename,_id,{myinput,isflag})
    console.log(data);
    // 更新页面
    let typeinput = this.data.typeinput.map(item=>{
      if(item._id == _id&&item.isflag==isflag){
        item.myinput =myinput
        item.isflag=isflag
      }
      return item
    })
    this.setData({typeinput})
  },
  // 删除分类
  async _del(e){
    let {id,index} = e.currentTarget.dataset
    // console.log(index);
    let data = await api._del(global.mytables.typename,id)
    console.log(data);
    if(1 == data.stats.removed){
      wx.showToast({
        title: '删除成功',
        icon:"none"
      })
    }
    this.data.typeinput.splice(index,1)
    this.setData({
      typeinput:this.data.typeinput
    })
  },
  // 添加到首页按钮
  _isflag(e){
   
    this.setData({
      isflag: e.detail.value
    })
  },
  _isflag2(e){
    this.setData({
      isflag: e.detail.value
    })
  },
  _select(e) {
    // if(e.currentTarget)
    // console.log(e.currentTarget.dataset.titile);
    // let titile= e.currentTarget.dataset.titile
    let files = e.detail.tempFilePaths
    files = files.map(item => {
      return { url: item }
    })
    this.setData({
      files
    })
    console.log(files);
  },
 
  async uploadImage() {
    // 获取所上传的所有地址
    let files = this.data.files
    let arr = []
    files.forEach((item, i) => {
      // 取图片的后缀名
      let extName = item.url.split('.').pop
      // 利用 时间戳 + "" + 索引 + 后缀
      let myCloudPath = Date.now() + "" + i + "." + extName
      // 把图片遍历存储  一次储存所有选中的图片
      let p = wx.cloud.uploadFile({
        cloudPath: myCloudPath,//上传云端后的名称
        filePath: item.url
      })
      // 把结果 赋值给p 等会上传到数据库
      arr.push(p);
    })
    //异步 Promise.all 等所有数据都遍历完后再执行下一步
    let data = await Promise.all(arr)
    // 将获取后的 数据  转化为 ['xxx','xxx.'....]
    data = data.map(item => item.fileID)
    // 把新数组返回
    return data
  }
})