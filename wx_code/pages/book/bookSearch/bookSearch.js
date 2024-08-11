
Page({


  data: {
    hotelList:[]
  },


  onLoad: function (options) {

  },
  getValue(event){
    console.log(event.detail.value)
    let inputValue = event.detail.value
    this.setData({
      inputValue
    })
    

  },
  search(){
    this.getList(1)
  },
  //所有
  getList(page){
    if(page == 1) {
      this.setData({
        list:[]
      })
    }
    const db = wx.cloud.database()
    const _ = db.command
    var that = this 
    wx.cloud.database().collection('word_books').where({
      name:db.RegExp({
        regexp: that.data.inputValue,
        //从搜索栏中获取的value作为规则进行匹配。
        options: 'i',
        //大小写不区分
      }),
    }).skip((page - 1) * 20).limit(20).orderBy('time','desc').get({
      success(res){
        console.log(res)

        if(res.data.length!=0){
          that.setData({
            list :that.data.list.concat(res.data)
          })
          that.getList(page + 1)
        }
        

      }
    })
  },
 
 
  
})