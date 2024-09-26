<template>
    <div full-height>
        <Loading v-if="loading" />





        
    </div>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    head: {
        title: '発注',
    },

    data: () => {
        return {
            loading: true,
            text : 'てきすと'
            
        }
    },
    mounted(){
        //this.loading = false
    },
    computed: {


        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),










        /* axios get example 
        ************************************************/
        axiosGetExample : async function(){

            return await this.$axios.get( process.env.API + 'api_path' ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

        },

        /* axios post example 
        ************************************************/
        axiosPostExample : async function(){

            var data = await ''

            var post = await new URLSearchParams()
            await post.append( 'data' , JSON.stringify( data ) )
            return await this.$axios.put( process.env.API + 'api_path', post ).then( function(result){

                return result.data

            }.bind(this)).catch((err) => { console.dir(err); })

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
