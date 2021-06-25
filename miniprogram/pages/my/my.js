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
    types: [{
      typename: "营养菜谱",
      'src': "../../static/type/type01.jpg"
    },
    {
      typename: "儿童菜谱",
      'src': "../../static/type/type02.jpg"
    },
    {
      typename: "家常菜谱",
      'src': "../../static/type/type03.jpg"
    },
    {
      typename: "主食菜谱",
      'src': "../../static/type/type04.jpg"
    },
    {
      typename: "西餐菜谱",
      'src': "../../static/type/type05.jpg"
    },
    {
      typename: "早餐菜谱",
      'src': "../../static/type/type06.jpg"
    },
    ],
    lists: [{
      src: "../../static/list/list01.jpg",
      name: "土豆小番茄披萨",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    },
    {
      src: "../../static/list/list02.jpg",
      name: "草莓巧克力三明治",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 88,
      follow: 200
    },
    {
      src: "../../static/list/list03.jpg",
      name: "法师意大利面",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    },
    {
      src: "../../static/list/list04.jpg",
      name: "自制拉花",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    },
    {
      src: "../../static/list/list05.jpg",
      name: "营养早餐",
      userInfo: {
        nickName: "林总小图",
        pic: "../../static/list/users.png"
      },
      views: 999,
      follow: 100
    }
    ],
    caidanlist:[]
  },

  // onLoad(){
  //   this.caidanlist()
  // },
  async caidanlist(){
    // 获取数据并分类
    let data = await api._findByWhere(global.mytables.datalist,{
      _openid: wx.getStorageSync('openid'),
      status: 1
    },{field:"time",order:"desc"})
    // console.log(data.data);
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
        this.caidanlist()
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
        //  console.log(req);
        if(req.data==null){

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
    this.setData({
      activeindex:index
    })
  }
})