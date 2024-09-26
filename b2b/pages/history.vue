<template>
  <div full-height>

    <Loading v-if="loading" />

    <Header :htitle="htitle"/>

    <main>
      <HistoryItem v-for="( history , index ) in histories" :history="history" />
    </main>

    <Footer/>

  </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    head: {
        title: '発注履歴',
    },

    data: () => {
        return {
            loading: true,
            text : '読み込み中...',
            
            histories : [],

            htitle : '発注履歴',
        }
    },
    created(){

        console.clear()

    },

    mounted(){

        this.historyInit()

    },
    computed: {


        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),

        historyInit : async function(){

            var getHistory = await this.userHistories()

            if( getHistory.status == 'success' ){

                this.histories = await getHistory.histories
                this.loading   = await false

            }
            else{

                this.loading   = await false
                var errMessage = await this.alertBox( getHistory.status , getHistory.message , getHistory.status )

            }

        },

        /* get user histories from data base.
        ***********************************************/
        userHistories : async function(){

            return await this.$axios.get(`${process.env.MAIN_API}/histories`).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

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
    filters:{

        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

    },

}
</script>
<style>

</style>
