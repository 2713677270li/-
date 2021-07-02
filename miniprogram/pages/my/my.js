import api from "../../utils/api"
import global from "../../utils/gloab"

// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeindex:0,
    isLogin: false, //是否登录。 false 未登录  true，已经登录
    userInfo: {}, //用户信息
    recipes: [
    //   {
    //   id: "1",
    //   recipeName: "烤苏格兰蛋",
    //   src: "../../imgs/1.jpg",
    //   opacity: 0, //遮罩层默认不显示
    // }
    ],
    types: [
    //   {
    //   typename: "营养菜谱",
    //   'src': "../../static/type/type01.jpg"
    // }
    ],
    lists: [
    ],
    caidanlist:[]
  },

  // onLoad(){
  //   this.caidanlist()
  // },
  async caidanlist(){
    // 获取数据并分类
    let _openid= wx.getStorageSync('openid')
    let data = await api._findByWhere(global.mytables.datalist,{
      _openid,
      status: 1
    },{field:"time",order:"desc"})
    // console.log(data.data);


    // console.log(types);
    // 获取我的关注数据
    // 首先获取已经关注的id
    
    // let asss = await api.findid(global.mytables.datalist,"79550af260d9cb0022a9da453dd8e690")
    // console.log(asss);

    let recipes =data.data
    let arr= [] //保存所有查询用户的请求
    // 获取本用户发布的菜品
    recipes.map(item=>{
      let p = api._findByWhere(global.mytables.table_user,{_openid:item._openid})
      arr.push(p)
    })
    let rest = await Promise.all(arr)
    // 为每一个菜品添加opacity属性
    recipes.map((item,i)=>{
      item.opacity = 0
      // 每一项添加上响应的  自己的头像和姓名
      item.userInfo = rest[i].data[0].userInfo
    })
    console.log(recipes);
    // console.log(data.data);
    this.setData({
      
      recipes
      
    })
  },
  //判断用户是否已经登录
  onShow() {
    //检测登录
    wx.checkSession({
      success: (res) => { //已登录
        //取出头像、用户昵称...
        let userInfo = wx.getStorageSync('userInfo')
        if(!userInfo){
          this.setData({  //修改数据
            isLogin: false
          })
          wx.showToast({
            title: '请登录',
            icon:"none"
          })
          return
        }
        this.caidanlist()
        switch (this.data.caidanlist) {
          case "0":
            this.caidanlist()
            break;
          case "1":
            this._types()
            break;
          case "2":
            this._lists()
            break;
          default:
            this.caidanlist()
            break;
          }
        this.setData({  //修改数据
          isLogin: true,
          userInfo
        })
      },
      fail: (err => {
        wx.showToast({
          title: '暂未登录',
          icon: "none"
        })
        this.setData({  //修改数据
          isLogin: false
        })
      })
    })
  },

  // 处理遮罩层显示问题
  _delStyle(e) {
    // 获取索引
    let index = e.currentTarget.dataset.index;
    // 将所有的列表都设置不显示
    this.data.recipes.map((item) => {
      item.opacity = 0;
    })
    // 将长按的列表项设置为选中
    this.data.recipes[index].opacity = 1;
    this.setData({
      recipes: this.data.recipes
    })

  },
  // 执行删除操作
  _doDelete(e) {
    let {index,id} = e.currentTarget.dataset;
    // let that = this
    // 如果没有显示删除图标，点击删除，直接返回
    if (!this.data.recipes[index].opacity) return;
    let _this = this;
    wx.showModal({
      title: "删除提示",
      content: "您确定删除么？",
      async success(res) {
        if (res.confirm) {
          //执行删除
          let data = await api._updatae(global.mytables.datalist,id,{status:2})
          // console.log(data);
          // let recipes = _this.data.recipes.splice(index,1)
          // // console.log('执行删除')
          // _this.setData({
          //   recipes
          // })
          if (data.stats.updated == 1) {
            wx.showToast({
              title: '删除成功',
            })
            //更新页面
            _this.data.recipes.splice(index, 1)
            _this.setData({
              recipes: _this.data.recipes
            })
          }
        } else {
          //取消删除
          _this.data.recipes[index].opacity = 0;
          _this.setData({
            recipes: _this.data.recipes
          })
        }
      }
    })
  },

  //登录
  async _login() {
    let that = this
    let userInfo
    try {
      let data = await wx.getUserProfile({ desc: '完善用户信息', })
      userInfo = data.userInfo
      wx.login({
        async success(res) {
          let result = await wx.cloud.callFunction({ name: "login", })
          let _openid = result.result.openid
          // console.log(openid);
         let req= await api._findByWhere(global.mytables.table_user,{_openid})
        //  console.log(req.data);
        if(req.data==null||req.data.length<=0){

          let rst = await api._add(global.mytables.table_user,{userInfo})
          if(!rst._id) return
        }else{
          userInfo = req.data[0].userInfo
        }
          wx.setStorageSync('userInfo', userInfo)
          wx.setStorageSync('openid', _openid)
          that.setData({
            isLogin: true,
            userInfo
          })
        }
      })
    } catch (error) {
      wx.showToast({
        title: '登录后体验更好',
        icon: "none"
      })
      that.setData({
        isLogin: false
      })
    }
  },
  _guanli(){
    let id = wx.getStorageSync('openid');
    if(id ==  global.mytables.userid){
      wx.navigateTo({
        url: '../category/category',
      })
    }
   
  },
  // 点击加号跳转
  _jia(){
    wx.navigateTo({
      url: '../pbrecipe/pbrecipe',
    })
  },
  // tab栏切换
  activeindex(e){
    // console.log(e.currentTarget.dataset.index);
    let index = e.currentTarget.dataset.index
    switch (index) {
      case "0":
        this.caidanlist()
        break;
      case "1":
        this._types()
        break;
      case "2":
        this._lists()
        break;
      default:
        this.caidanlist()
        break;
      }
   
    this.setData({
      activeindex:index
    })
  },
  _detil(e){
    let {id} = e.currentTarget.dataset
    // console.log(id);
    wx.navigateTo({
      url: `../detail/detail?id=${id}`,
    })
  },
  // 跳转到 列表页
  _type(e){
    let {id,name,tag} = e.currentTarget.dataset
    wx.navigateTo({
      url:`../list/list?id=${id}&name=${name}&tag=${tag}`,
    })
 },
 _detilxq(e){
  let {id} = e.currentTarget.dataset
  wx.navigateTo({
   url: `../detail/detail?id=${id}`,
 })
},
async _types(){
  let _openid= wx.getStorageSync('openid')
    if(!_openid) return
  let where = {
    _openid,
    status: 1
  }
  let rst1 = await api._findByWhere(global.mytables.datalist, where)
  if (rst1.data == null) return
  let datas = rst1.data.map(item => item.recipeTypeid)
  datas = [...new Set(datas)]
  // console.log(datas);
  let types = []
  datas.forEach(item => {
    types.push(api.findid(global.mytables.typename, item))
  })
  types = await Promise.all(types);
  types = types.map(item=>{
    return item.data
  })
  // types =types.data
  // console.log(types);
      this.setData({
        types
      }) 
      // console.log(types);
      // 根据自己的openid 获取自己发布的分类
      // let types = await api._findByWhere(global.mytables.typename,{
      //   _openid
      // })
      // types =types.data
      // console.log(types);
},
async _lists(){
  let _openid= wx.getStorageSync('openid')
  if(!_openid) return
  let ids = await api._findByWhere(global.mytables.follow)
  if (ids.data == null) { //没有关注的数据
    this.setData({ lists: [] })
    return
  }
  ids=ids.data
  //  从follow表中获取到 所有自己点过赞的作品的id
  // console.log(ids);
  let idd = [];
  // 根据自己点过赞的作品的id 获取点过赞的作品
  [...ids].forEach(item=>{
    let d = api.findid(global.mytables.datalist,item.recipeId)
    // console.log(d);
    idd.push(d)
  })
  // 自己关注的数据
  // 获取自己点过赞的作品后 取点过赞的作品的data数据
  let restids = await Promise.all(idd)
  restids = restids.map(item=>{
    return item.data
  })
  // console.log(restids);
  // 获取自己点过赞的作品的发布者
  let idd1=[]
  ids.map(item=>{
    let p = api._findByWhere(global.mytables.table_user,{_openid:item._openid})
    idd1.push(p)
  })
  let iddyh = await Promise.all(idd1)
  // 将点过赞的作品的 作品数据和发布者的数据结合
  restids.map((item,i)=>{
    item.opacity = 0
    // 每一项添加上响应的  自己的头像和姓名
    item.userInfo = iddyh[i].data[0].userInfo
  })
  // console.log(restids);
   this.setData({
      lists:restids
   })
}
})