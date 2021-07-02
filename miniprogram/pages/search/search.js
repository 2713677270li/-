// pages/search/search.js
import api from "../../utils/api"
import floab from "../../utils/gloab"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotlist:[],
    lists:[],
    name:""
  },
  onShow(){
    this._getlist()
    this._onshow()
  },
  _onshow(){
    let arr = wx.getStorageSync('lists') || []
    this.setData({
      lists:arr
    })
  },
 async _getlist(){
    // let data = await api._findByWhere(floab.mytables.datalist)
    let {data} = await api.findbypage(floab.mytables.datalist,{},6)
    let hotlist = data
    this.setData({
      hotlist
    })
  },
  _hotxq(e){
    let {id,name} = e.currentTarget.dataset
 
    let arr = wx.getStorageSync('lists') || []
   let index= arr.findIndex(item=>{
      return item == name
    })
    if(index != -1){
      arr.splice(index,1)
    }
    arr.unshift(name)
    wx.setStorageSync('lists', arr)
    
    console.log(arr);
    this.setData({
      lists:arr
    })
       wx.navigateTo({
      url: `../detail/detail?id=${id}`,
    })
  },
  _tolist(e){
    let {id=null,name="",tag} = e.currentTarget.dataset
    if(name==""){
      name=this.data.name
    }
    let arr = wx.getStorageSync('lists') || []
    let index= arr.findIndex(item=>{
       return item == name
     })
     if(index != -1){
       arr.splice(index,1)
     }
     arr.unshift(name)
     wx.setStorageSync('lists', arr)
     
     console.log(arr);
     this.setData({
       lists:arr
     })
    // console.log(this.data.name);
    // console.log(name);
    wx.navigateTo({
      url: `../list/list?id=${id}&name=${name}&tag=${tag}`,
    })
  }
})