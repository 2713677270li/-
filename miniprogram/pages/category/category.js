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
    // console.log(myinput);
    // 判断input值是否为空
    if(myinput==""){
      wx.showToast({
        title: '请不要输入空内容',
        icon:"none"
      })
      return
    } 
    // 判断 新增类名是否已存在
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
    // 添加分类
    let rst = await api._add(global.mytables.typename,{myinput})
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
    // 如果设置为空 提醒
    if(updateinput==""){
      wx.showToast({
        title: '请不要输入空内容',
        icon:"none"
      })
      return
    } 
    // 更新修改后的值
    let data = await api._updatae(global.mytables.typename,_id,{myinput})
    console.log(data);
    // 更新页面
    let typeinput = this.data.typeinput.map(item=>{
      if(item._id == _id){
        item.myinput =myinput
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
  }
})