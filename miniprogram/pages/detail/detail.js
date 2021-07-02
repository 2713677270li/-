// pages/detail/detail.js
import api from "../../utils/api"
import floab from "../../utils/gloab"
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      imgs:[
        // "../../static/detail/1.jpg",
        // "../../static/detail/2.jpg",
        // "../../static/detail/4.jpg",
        // "../../static/detail/6.jpg",
        // "../../static/detail/8.jpg",
      ],
      id:null,
      datalist:null,
      userInfo:null,
      myinput:null,
      isflag:false,
      res:null,
      timer:null
  },
  onLoad(options){
    // console.log(11111111111111);
    // console.log(options);
    this.setData({
      id:options.id
    })
    this.getlist()
  },
  async getlist(){
    let res = await api.findid(floab.mytables.datalist,this.data.id)
    let data = await api._findByWhere(floab.mytables.table_user,{_openid:res._openid})
    let ret = await api.findid(floab.mytables.typename,res.data.recipeTypeid)
    // console.log(ret);
    // console.log(data);
    let myinput = ret.data.myinput
    let userInfo = data.data[0].userInfo
    let rst = await api._updatae(floab.mytables.datalist, this.data.id, {
      views: db.command.inc(1) 
    })
    // console.log(rst);
    if (rst.stats.updated == 1) {   //更新成功
      data.views++
    }
    let uInfo = wx.getStorageSync('userInfo')
    // console.log(userinfo);
    if(!uInfo){
      this.setData({
        datalist:res.data,
        userInfo,
        myinput
      })
      return
    }
    // console.log( res.data._openid);
    // console.log(this.data.id);
    let r = await api._findByWhere(floab.mytables.follow, {
      _openid: res.data._openid,   //_openid
      recipeId: this.data.id //菜品id
    })
    // console.log(r);
    if (r.data == null || r.data.length == 0) {   //当前用户未关注次菜品
      this.data.isflag = false
    } else {
      this.data.isflag = true
    }
    this.setData({
      datalist:res.data,
      userInfo,
      myinput,
      isflag:this.data.isflag,
      res:res.data 
    })
  },
  async _isflag(){
    // 首先获取 本地存储  看用户是否登录
    let uInfo = wx.getStorageSync('userInfo')
    // 若用户没登录直接return  提示用户还没有登录
    if(!uInfo){
    // console.log(userinfo);
    wx.showToast({
      title: '请先去登陆',
      icon:"none"
    })
      return
    }
    // 如果还没有关注  改为关注状态 并且关注次数加一
    if(!this.data.isflag){
      //  给数据库 添加数据  若已经点过赞 则添加已点赞的数据 把openid和 id传过去
      let data = await api._add(floab.mytables.follow,{
        // opdata,
        recipeId: this.data.id
      })
      // console.log(data);
      // 如果添加成功  让按钮变为已关注状态  isflag:true,
      // 并且点赞次数加一
      if(data){
        let rst = await api._updatae(floab.mytables.datalist, this.data.id, {
          follows: db.command.inc(1) 
        })
      }
      this.data.datalist.follows++
      this.setData({
        isflag:true,
        datalist:this.data.datalist
      })
      return 
    }
    if(this.data.isflag){

      // 取消评论  本地取消
    //   let data = await api.whweredel(floab.mytables.follow,{
    //     _openid:this.data.res._openid,
    //     recipeId: this.data.id
    //   })
    //   console.log(data);
    //   if(data){
    //     let rst = await api._updatae(floab.mytables.datalist, this.data.id, {
    //       follows: db.command.inc(-1) 
    //       // follows:this.data.datalist.follows-1
    //     })
    //     // let follow =  datalist.follow
    //   }
    //     this.data.datalist.follows--
    //   this.setData({
    //     isflag:false,
    //     datalist:this.data.datalist
    //   })
    //   return


    // 取消评论   云函数取消
    // 若果用户已点赞   点击则取消点赞
    let _openid= wx.getStorageSync('openid')
    let where = {
      _openid,
      recipeId: this.data.id
    }
    // console.log(where);
    // 利用 openid 和 recipeId 把 follow中存在的数据删除
    wx.cloud.callFunction({
      name: 'do_del',
      data: {
        collectionName:floab.mytables.follow,
       where
      },
    }).then(async res=>{
      // 删除成功   点赞次数减一 且显示未点赞 isflag:false
      if(res.result.stats.removed == 1){
           let rst = await api._updatae(floab.mytables.datalist, this.data.id, {
             follows: db.command.inc(-1) 
           })
           this.data.datalist.follows--
         this.setData({
           isflag:false,
           datalist:this.data.datalist
         })
         return
      }
    }).catch(res=>{
      // 如果删除失败  则提示网络错误
      console.log(res);
      wx.showToast({
        title: '请检查您的网络',
      })
    })
    }
   
    
  }
  
})