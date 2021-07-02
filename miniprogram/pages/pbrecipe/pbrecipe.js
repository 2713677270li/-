import api from "../../utils/api"
import global from "../../utils/gloab"

// pages/pbrecipe/pbrecipe.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeinput: [],//获取食品分类
    files: [],//渲染选中的图片
  },
  onLoad: function (options) {
    this.getinput()
  },
  // 获取数据
  async getinput() {
    let data = await api._findByWhere(global.mytables.typename)
    // console.log(data.data);
    this.setData({
      typeinput: data.data
    })
  },
  // mp-uploader 默认的选择图片事件
  _select(e) {

    let files = e.detail.tempFilePaths
    // console.log(files);
    // 给获取的 图片改变为 渲染的格式
    files = files.map(item => {
      return { url: item }
    })
    files = this.data.files.concat(files)
    this.setData({
      files
    })
    // console.log(files);
  },
  _delimg(e) {
    let index = e.detail.index
    this.data.files.splice(index, 1)
  },
  async _addlist(e) {
    let { typeName, recipeTypeid, recipesMake } = e.detail.value //菜名 分类id  菜品做法
    let follows = 0,  //收藏次数
      views = 0,   //浏览次数
      status = 1,     //是否已删除  1  未删除 2 删除
      time = Date.now()
    // 把 数据上传到云端存储  并返回所有的图片地址
    let fields = await this.uploadImage()
    // console.log(fields);
    // 上传到数据库
    let arr = await api._add(global.mytables.datalist, {
      typeName,
      recipeTypeid,
      recipesMake,
      follows,
      views,
      status,
      time,
      fields
    })
    // console.log(arr);
    // 利用 判断 arr.id 是否有值 提醒更新成功
    if (arr._id) {
      wx.showToast({
        title: '新添加了了一道菜',
        duration: 1500,
        success(res) {
          if(res){
            wx.navigateBack({
              delta: 1,
            })
          }
        }
      })
    }
    // 更新成功1.5秒后跳转到my页面
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
