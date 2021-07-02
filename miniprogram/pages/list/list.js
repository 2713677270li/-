import api from "../../utils/api"
import gloab from "../../utils/gloab"

// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [
      // {
        // src: "../../static/list/list01.jpg",
        // name: "土豆小番茄披萨",
        // userInfo: {
        //   nickName: "林总小图",
        //   pic: "../../static/list/users.png"
        // },
        // views: 999,
        // follow: 100
      // }
    ],
    id: '',
    page:1,
    isflag:false,
    typename:''
  },
  onLoad(options) {
    this.data.id = options.id
    this.data.tag = options.tag
    this.data.typename = options.name
    console.log( options.name);
    this.setData({
      typename: options.name
    })
    wx.setNavigationBarTitle({
      title:this.data.typename,
    })
    this._getRecipeList()
  },
  async _getRecipeList() {
    // console.log(111111);
    let where = {},
      orderBy = {}
    switch (this.data.tag) {
      case "ptcp":
        where = {status:1,recipeTypeid: this.data.id}
        orderBy= { field: "time", order: 'desc' }
        break;
      case "gzcp":
        where = { status: 1 }
        orderBy = { field: "follows", order: "desc" }
      case "rmcp":
        where = { status: 1 }
        orderBy = { field: "views", order: "desc" }
        break;
      case "search":
        console.log('搜索',this.data.typename);
        where={status: 1,
          typeName: gloab.db.RegExp({
            regexp: this.data.typename,
            options:'i' ,
          })
        }
        orderBy = { field: "views", order: "desc" }
        break;
      default:
        console.log('默认菜谱');
        break;
    }
    let data = await api.findbypage(gloab.mytables.datalist,where,5,this.data.page,orderBy)
    let lists = data.data
    let arr=[]
    lists.forEach(item=>{
      let p = api._findByWhere(gloab.mytables.table_user,{_openid:item._openid})
      arr.push(p)
    })
    let rst = await Promise.all(arr)
    lists.forEach((item, index) => {
      item.userInfo = rst[index].data[0].userInfo
    })
    // console.log(lists);
    let isflag = lists.length < 5 ? true : false;
   lists = this.data.lists.concat(lists)
    this.setData({
      lists,
      isflag
    })
  },
  onReachBottom() {
    if(this.data.isflag) return
    this.data.page++
    this._getRecipeList()
  },
  _detilxq(e){
     let {id} = e.currentTarget.dataset
     wx.navigateTo({
      url: `../detail/detail?id=${id}`,
    })
  
  }
})