<template>
    <div full-height>
        <Loading v-if="loading" :text="text"/>

        <div app-header>
            <h1>お気に入りリスト</h1>
        </div>

        <div app-body>
            <div product-list>

                <Product v-for="(product , index) in product_list" :product="product" :key="index" />

            </div>
        </div>

        <Footer app-footer/>

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
            text : '読み込み中...',

            product_list : ''
            
        }
    },
    async created(){

        await this.init()

        var clone = await JSON.parse( JSON.stringify( this.products ) )
        this.product_list = (clone ? await clone.filter( p => this.favorites.includes( p.product_id ) ) : '')

    },

    mounted(){
        
        this.loading = false
    
    },
    computed: {

        product_list__ : function(){

            var clone = JSON.parse( JSON.stringify( this.products ) )
            return clone.filter( p => this.favorites.includes( p.product_id ) )

        },

        ...mapGetters( 'config'  ,[ 'config' , 'products' , 'userProfile' , 'units' , 'favorites' , 'delivConfig' ] ),
        ...mapGetters( 'cart'    ,[ 'cart' , 'cartCount' , 'session_id' ] ),
    },
    methods:{
        ...mapActions('config'  ,[ 'setConfig' , 'setProducts' , 'setUserProfile' , 'setUnits' , 'setFavorites' , 'setDelivConfig' ]),
        ...mapActions('cart'    ,[ 'setCart' , 'clearCart' , 'setSession' ]),

        init : async function(){

            if( this.favorites == '' ){

                var fav_data = await this.loadFavorites()
                await this.setFavorites( fav_data?.data )

            }

            return await true

        },

        // Get user Favorites Data.
        loadFavorites : async function(){

            return await this.$axios.get(`${process.env.MAIN_API}/favorites`).then( function(result){

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
