// pages/type/type.js
import api from "../../utils/api"
import gloab from "../../utils/gloab"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types:[
      // {typename:"营养菜谱",'src':"../../static/type/type01.jpg"},
      // {typename:"儿童菜谱",'src':"../../static/type/type02.jpg"},
      // {typename:"家常菜谱",'src':"../../static/type/type03.jpg"},
      // {typename:"主食菜谱",'src':"../../static/type/type04.jpg"},
      // {typename:"西餐菜谱",'src':"../../static/type/type05.jpg"},
      // {typename:"早餐菜谱",'src':"../../static/type/type06.jpg"},
    ]
  },
  onLoad(){
    this.typeslist()
  },
  async typeslist(){
   let data =  await api._findByWhere(gloab.mytables.typename) 
  //  console.log(data.data);
   data=data.data
   data.map((item,i)=>{
     item.src="../../static/type/type0"+(++i)+".jpg"
   })
   this.setData({
    types:data
   })
   console.log(data);
  },
  _type(e){
    let {id,name,tag} = e.currentTarget.dataset
    wx.navigateTo({
      url:`../list/list?id=${id}&name=${name}&tag=${tag}`,
    })
}
})