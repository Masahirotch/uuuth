<template>
  <div full-height>
    <Loading v-if="loading" />

    <Header :htitle="htitle"/>

    <main>
      <MyListItem v-for="( list , index ) in mylist" :list="list" @deleteMylist="deleteMylist" />
    </main>

    <Footer/>

  </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    head: {
        title: '各種設定',
    },

    data: () => {
        return {
            loading : true,
            text    : 'てきすと',
            
            mylist  : [],

            htitle : 'マイリスト',

        }
    },
    mounted(){
        
        this.loadMylist()
    
    },
    computed: {


        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),


        loadMylist : async function(){

            var load_mylist = await this.loadMylistFromDatabase()



            await console.dir( load_mylist )

            this.mylist = await load_mylist.mylist


            this.loading = await false

        },

        loadMylistFromDatabase : async function(){

            return await this.$axios.get(`${process.env.MAIN_API}/mylist`).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        deleteMylist(listId) {
            this.mylist = this.mylist.filter(list => list.list_id !== listId)
        },

        /***************************************************************
         * type (str) : success / info / warning / error
         * https://element.eleme.io/#/en-US/component/message-box
        ****************************************************************/
        alertBox : async function( title , message , type ){

            this.$alert( message , title , {
              confirmButtonText: 'OK',
              type : type,
              dangerouslyUseHTMLString : true,
              callback: action => {

                return

              }
            });

        },

    },
    filters: {

        number_format : function (value) {

            if (!value.match(/^\d+$/)) { return value }

            let formatter = new Intl.NumberFormat('ja-JP')
            return formatter.format(value)

        },

    },

}
</script>
<style>

</style>
