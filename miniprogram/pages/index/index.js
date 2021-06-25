import api from "../../utils/api"
import gloab from "../../utils/gloab"
Page({
    data: {
        types: [
            // {
            //     src: "../../imgs/index_07.jpg",
            //     typename: "营养菜谱"
            // },
            // {
            //     src: "../../imgs/index_09.jpg",
            //     typename: "儿童菜谱"
            // },
        ],
        recipes:[
            // {
            //     recipeName:"烤苏格兰蛋",
            //     src:"../../imgs/1.jpg"
            // }
        ]
    },
    // 页面初始化渲染 分类标签
    onLoad(){
        this._gettimes()
    },
    // 每次更新 渲染热门菜谱
    onShow(){
        this.hot()
    },
    // 获取食品分类
    async _gettimes(){
        let {data} = await api.findbypage(gloab.mytables.typename,{},2)
        // data.data.map()
        // console.log(data);
        data[0].src="../../imgs/index_07.jpg"
        data[1].src="../../imgs/index_09.jpg"
        this.setData({
            types:data
        })
        // console.log(data);
    },
    // 获取热门菜谱
    async hot(){
        let {data} = await api.findbypage(gloab.mytables.datalist,{status:1},4,1,{field: 'views', order: 'desc'})
        console.log(data);
        let arr = []
        data.forEach(item=>{
            let p = api._findByWhere(gloab.mytables.table_user,{_openid:item._openid})
            arr.push(p)
        })
        let rest = await Promise.all(arr)
        // console.log(rest);
        // console.log(rest[0].data[0].userInfo);
        data.map((item,i)=>{
            item.usetInfo = rest[i].data[0].userInfo
        })
        // console.log(data);
        this.setData({
            recipes:data
        })
    },
    _clist(){
        wx.navigateTo({
          url: '../type/type',
        })
    }
    
})