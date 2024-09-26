<template>
  <div content>
    <Loader text="" v-if="loading" />

    <h2 id="content-header">
      <h3>野菜情報ユーザー管理</h3>
      <div id="sort-box">
        <div>
          <el-button size="small" v-bind:class="{ active: isAll      }" @click="filterAll" >全て</el-button>
          <el-button size="small" v-bind:class="{ active: isApproval }" @click="filterApproval" >利用承認済</el-button>
          <el-button size="small" v-bind:class="{ active: isMonthly  }" @click="filterMonthly">単価月極</el-button>
          <el-button size="small" v-bind:class="{ active: isD        }" @click="filterD">D単価</el-button>
          <el-button size="small" v-bind:class="{ active: is365      }" @click="filter365">365日対応</el-button>
          <el-button size="small" v-bind:class="{ active: isCalendar }" @click="filterCalendar">市場カレンダー</el-button>
        </div>
        <div>
          <el-button size="small" type="warning" @click="sortFromCode" class="mr-1i">店舗コード <i class="el-icon-d-caret"></i></el-button>
          <el-input placeholder="店舗名で絞り込み" v-model="shopname" class="shopname-filter"></el-input>
        </div>
      </div>
    </h2>

    <div id="yasai_info" v-cloak pb-5i>


      <div id="shop_loop">

          <div v-for="(user , index) in users" class="shop_detail" v-if="user.isView">

          <h3 class="bizname">
            <div class="left">
              <span>{{user.bizName}}</span>
              <span>{{user.manager}}</span>
              <span>{{user.shop_tel}}</span>
            </div>
            <div class="right">
              <el-input placeholder="店舗コード" v-model="user.shopCode"></el-input>
              <el-button size="mini" @click="updateShopCode(user,user.shopCode)">更新</el-button>
            </div>
          </h3>
          <div>

            <dl class="user-header">
              <dd>登録者LINE名</dd>
              <dd>担当者TEL</dd>
              <dd>利用承認</dd>
              <dd>単価月極</dd>
              <dd>D単価</dd>
              <dd>365日対応</dd>
              <dd>市場カレンダー</dd>
              <dd>商品購入</dd>
              <dd>&nbsp;</dd>
            </dl>

            <dl class="user-parent">
              <dd><i class="el-icon-s-custom parent-icon" shop-master-icon></i>{{user.displayName}}</dd>
              <dd>{{user.user_tel}}</dd>
              <dd class="switch-box">
              <el-switch v-model="user.flg_active" active-color="#13ce66" @change="flgSet($event,user.userId,'flg_active')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="user.flg_1" change="flgSet" @change="flgSet($event,user.userId,'flg_1')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="user.flg_2" change="flgSet" @change="flgSet($event,user.userId,'flg_2')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="user.flg_3" change="flgSet" @change="flgSet($event,user.userId,'flg_3')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="user.flg_4" change="flgSet" @change="flgSet($event,user.userId,'flg_4')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="user.flg_5" change="flgSet" @change="flgSet($event,user.userId,'flg_5')"></el-switch>
              </dd>

            </dl>

            <dl v-if="childrenExists(user.child)" v-for="( child ) in user.child" class="user-parent" children-loop>
              <dd><i class="el-icon-user parent-icon"></i>{{child.displayName}}</dd>
              <dd>{{child.user_tel}}</dd>
              <dd class="switch-box">
              <el-switch v-model="child.flg_active" active-color="#13ce66" @change="flgSet($event,child.userId,'flg_active')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="child.flg_1" change="flgSet" @change="flgSet($event,child.userId,'flg_1')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="child.flg_2" change="flgSet" @change="flgSet($event,child.userId,'flg_2')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="child.flg_3" change="flgSet" @change="flgSet($event,child.userId,'flg_3')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="child.flg_4" change="flgSet" @change="flgSet($event,child.userId,'flg_4')"></el-switch>
              </dd>
              <dd class="switch-box">
              <el-switch v-model="child.flg_5" change="flgSet" @change="flgSet($event,child.userId,'flg_5')"></el-switch>
              </dd>
              <dd><el-button size="mini" type="danger" @click="childDelete( child )">削除</el-button></dd>
            </dl>

          </div>
          </div>

      </div>
    </div>

  </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'

export default {
  data() {
    return {

        allItem : '',
        activeNames : '1',
        userTemp : '',
        loading : true,

        isAll : true,
        isApproval : false,
        isMonthly : false,
        isD : false,
        is365 : false,
        isCalendar : false,

        sortCode : true,
        shopname : '',
    }
  },
  watch : {

    shopname : function(value){

      if( value != '' ){

        this.userTemp.forEach( item => {

          if( item.bizName !== null && item.bizName.includes(value) ) item.isView = true
          if( item.bizName !== null && !item.bizName.includes(value) ) item.isView = false
          if( item.bizName == null ) item.isView = false

        })

        this.userTemp.forEach( item => {

            item.isView = false

            if( item.displayName !== null && item.displayName.includes(value) ) item.isView = true
            if( item.bizName !== null && item.bizName.includes(value) ) item.isView = true
            if( item.shop_tel !== null && item.shop_tel.includes(value) ) item.isView = true
            if( item.shopCode !== null && item.shopCode.includes(value) ) item.isView = true

        })




      }
      if( value == '' ){

        this.userTemp.forEach( item => item.isView = true )

      }

    },

  },

  mounted(){
    console.clear()
    this.getUsers()
  },
  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'info' , ['allParent']),
      users(){

        return this.userTemp

      },
  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'info' , ['setAllParent']),

      // ユーザー一覧を取得
      getUsers: function(){

          axios.post( process.env.API_URL + 'getParentUsers' , {
            token: process.env.INFO_TOKEN,
          })
              .then( function(result){

                 console.dir(result.data.parentUsers)

                this.setAllParent(result.data.parentUsers)
                this.userTemp = JSON.parse( JSON.stringify( this.allParent ) )

              }.bind(this))
              .catch((err) => {

                  console.dir(err)

              })
              .finally(function(){

                  this.loading = false

              }.bind(this))

      },

      // ユーザーの配信フラグをセット
      flgSet : function(e,userId,flg){

        this.loading = true

            axios.post( process.env.API_URL + 'updateUser' , {
                      token: process.env.INFO_TOKEN,
                      userId: userId,
                      set_user: {[flg]: e},
                    }  )
              .then( function(result){

                console.dir(result.data.parentUsers)

                this.setAllParent(result.data.parentUsers)

              }.bind(this))
              .catch((err) => {

                console.dir(err)

              })
              .finally(function(){
                this.loading = false
              }.bind(this))

      },

      // 店舗コードを保存
      updateShopCode : function(user,shopcode){

        this.loading = true

        var params = new FormData();
            params.append( 'token'    , process.env.INFO_TOKEN )
            params.append( 'action'   , 'addShopCode' )
            params.append( 'ID'       , user.ID )
            params.append( 'shopCode' , shopcode )

            axios.post( process.env.API_URL + 'updateUser' , {
                      token: process.env.INFO_TOKEN,
                      ID: user.ID,
                      set_user: {shopCode: shopcode},
                    }  )
              .then( function(result){

                console.dir(result.data)
                this.setAllParent(result.data.parentUsers)

              }.bind(this))
              .catch((err) => {

                console.dir(err)

              })
              .finally(function(){
                this.loading = false
              }.bind(this))

      },


      /*
      店舗表示フィルター
      **************************************/
      // 全て
      filterAll : function(){
        this.userTemp   = JSON.parse(JSON.stringify( this.allParent ))
        this.setFlg('isAll')
      },

      filterApproval : function(){
        let setData = JSON.parse(JSON.stringify( this.allParent ))
        const filterData = setData.filter(value => value.flg_active == true )
        this.userTemp   = filterData
        this.setFlg('isApproval')
      },

      filterMonthly : function(){
        let setData = JSON.parse(JSON.stringify(this.allParent))
        const filterData = setData.filter(value => value.flg_1 == true )
        this.userTemp   = filterData
        this.setFlg('isMonthly')
      },

      filterD : function(){
        let setData = JSON.parse(JSON.stringify(this.allParent))
        const filterData = setData.filter(value => value.flg_2 == true )
        this.userTemp   = filterData
        this.setFlg('isD')
      },

      filter365 : function(){
        let setData = JSON.parse(JSON.stringify(this.allParent))
        const filterData = setData.filter(value => value.flg_3 == true )
        this.userTemp   = filterData
        this.setFlg('is365')
      },

      filterCalendar : function(){
        let setData = JSON.parse(JSON.stringify(this.allParent))
        const filterData = setData.filter(value => value.flg_4 == true )
        this.userTemp   = filterData
        this.setFlg('isCalendar')

      },


      setFlg : function(set){

        this.isAll = false
        this.isApproval = false
        this.isMonthly = false
        this.isD = false
        this.is365 = false
        this.isCalendar = false
        this[set] = true
        this.shopname = ''

      },

      // ショップコードで並び替え
      sortFromCode : function(){

        this.sortCode = !this.sortCode

        // true = DESC
        if(this.sortCode){

          this.userTemp = [...this.userTemp].sort( (a, b) => b.shopCode - a.shopCode);

        }

        // false = ASC
        if(!this.sortCode){

          this.userTemp = [...this.userTemp].sort( (a, b) => a.shopCode - b.shopCode );

        }

      },

      childrenExists : function(child){

          if( child.length > 0 ) return true
          if( child.length == 0 ) return false

      },



      /* 子番号の削除
      ******************************************************/
      childDelete : function( child ){

            console.dir(child)

            this.$confirm('<p>「'+ child.displayName +'」</p><p>このユーザーを削除してもよろしいですか?</p>', 'この操作は取り消せません', {
              confirmButtonText: 'OK',
              dangerouslyUseHTMLString: true,
              cancelButtonText: 'Cancel',
              type: 'warning'
          }).then( function(){

                this.loading = true

                    console.log("child.ID=" + child.ID)
                    axios.post( process.env.API_URL + 'deleteUser' , {
                      token: process.env.INFO_TOKEN,
                      ID: child.ID
                    } )
                      .then( function(result){

                        console.dir(result.data.parentUsers)
                this.setAllParent(result.data.parentUsers)
                this.userTemp = JSON.parse( JSON.stringify( this.allParent ) )

                      }.bind(this))
                      .catch((err) => { console.dir(err); })
                      .finally(function(){ }.bind(this))

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){ this.loading = false; }.bind(this))

      },




  },

};
</script>
<style>
[shop-master-icon]{
    transform:scale(1.5);
}
#yasai_info{padding:12px;}
#content-header{
    font-size: 16px;
    line-height: 3em;
    position: sticky;
    top: -1px;
    z-index: 9;
    padding:0.5em;
    background:#f0f0f1;
    margin-top:-1px;
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
#content-header h3{
  padding-left: 1em;
}

.update-nag.notice.notice-warning.inline{display:none;}
#shop_loop{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:column wrap;flex-flow:column wrap;
  -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
  margin-top:1em;
}
.shop_detail{
    width: 100%;
    margin-bottom: 1em;
    border: 1px solid #ccc;
    padding: 0.2em;
    border-radius: 0.2em;
}
.shop_detail h3{
  background:#e2e2e2;
  color:#000;padding:0.5em;
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
  position:relative;
  min-height:20px;
}
.shop_detail h3 .left,
.shop_detail h3 .right{
  display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;

}

.shop_detail h3 .left span{padding:0.3em 1em;}
.shop_detail h3 .right .el-input{
  width:10em;
  padding-right:0.8em;
}
.shop_detail h3 .right .el-input input.el-input__inner{
  min-height:inherit;
  height:2em;
}


.user-parent,.user-loop,.user-header{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
dl.user-parent > dt,
dl.user-parent > dd,
dl.user-loop > dt,
dl.user-loop > dd,
.user-header > *{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
  margin:0;padding:0.8em 1em;border-right:1px solid #efefef;
}
dl.user-parent > dt:last-child,
dl.user-parent > dd:last-child,
dl.user-loop > dt:last-child,
dl.user-loop > dd:last-child,
.user-header > *:last-child{
  border:none;
}

dl.user-header dd{
  padding:0.3em;font-size:12px;
}


.user-header > dd{
  font-size:min(3.2vmin , 13px);font-weight:bold;
  -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
}
.parent-icon{margin-right:0.4em;}

dl.user-parent,dl.user-header{background:#FFF;}
dl.user-header{border-bottom:1px solid #000;}


dl.user-parent > dd{
  font-size:min(3.2vmin , 13px);font-weight:400;
}

dl.user-parent > dd.switch-box{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
dl.user-parent > dd.switch-box{
  -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
}



dl.user-header > dd:nth-of-type(1),dl.user-parent > dd:nth-of-type(1),dl.user-child > dd:nth-of-type(1){width:15%;}
dl.user-header > dd:nth-of-type(2),dl.user-parent > dd:nth-of-type(2),dl.user-child > dd:nth-of-type(2){width:15%;}
dl.user-header > dd:nth-of-type(3),dl.user-parent > dd:nth-of-type(3),dl.user-child > dd:nth-of-type(3){width:10%;}
dl.user-header > dd:nth-of-type(4),dl.user-parent > dd:nth-of-type(4),dl.user-child > dd:nth-of-type(4){width:10%;}
dl.user-header > dd:nth-of-type(5),dl.user-parent > dd:nth-of-type(5),dl.user-child > dd:nth-of-type(5){width:10%;}
dl.user-header > dd:nth-of-type(6),dl.user-parent > dd:nth-of-type(6),dl.user-child > dd:nth-of-type(6){width:10%;}
dl.user-header > dd:nth-of-type(7),dl.user-parent > dd:nth-of-type(7),dl.user-child > dd:nth-of-type(7){width:10%;}
dl.user-header > dd:nth-of-type(8),dl.user-parent > dd:nth-of-type(8),dl.user-child > dd:nth-of-type(8){width:10%;}

#content-header{
  display: -webkit-flex; display: -ms-flexbox; display: flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: space-between;-ms-flex-pack: justify; justify-content: space-between;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}

#sort-box{
  display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
}
#sort-box > div{
  display : -webkit-inline-box; display : -ms-inline-flexbox; display : -webkit-inline-flex; display : inline-flex;
  -ms-flex-flow:row nowrap;flex-flow:row nowrap;
  -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
  -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
  margin-left:10px;
}

.el-button+.el-button{margin-left: 1px;}

#sort-box .el-button.el-button--small.active{
  background:#409eff;
}
#sort-box .el-button.el-button--small.active span{
  color:#FFF;
}
.shopname-filter{
  margin-right:1em;
}
.shopname-filter input{
  height:33px;

}
[children-loop]{
    border-top:1px dashed #CCC;
}
</style>
