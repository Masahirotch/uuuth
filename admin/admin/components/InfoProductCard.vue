<template>
  <div card-content>
        <img :src="item.productPhoto" class="image" @click="submitParent(index)">
        <div detail-box>
          <p>{{product.productName}}</p>
          <p split>
            <span>{{product.productPrice|number_format}} 円</span>
            <span><span mr-05>販売</span> <el-switch v-model="product.isOnSale" @change="chengeSale(index)"></el-switch></span>
          </p>
        </div>
  </div>
</template>

<script>
  import { mapState , mapGetters, mapActions } from 'vuex'
  import axios from 'axios'

export default {
  props : ['item','index'],
  data() {
    return {

    }
  },
  watch : {

  },
  mounted(){

  },
  computed: {
      ...mapGetters( 'user' , ['userProfile','login']),
      ...mapGetters( 'infoProducts' , ['products']),

      product : function(){

        return JSON.parse( JSON.stringify( this.products[this.index] ) )

      }

  },
  methods:{
      ...mapActions( 'user' , ['setProfile','setLogin']),
      ...mapActions( 'infoProducts' , ['setProducts']),

      chengeSale : function(index){

          this.loading = true

          axios.post( process.env.API_URL + 'updateProduct' , {
            token: process.env.INFO_TOKEN,
            product_id: this.product.productId,
            set_product: { isOnSale:  this.product.isOnSale },
          } )
            .then( function(result){

              this.setProducts(result.data.products)

            }.bind(this))
            .catch( function(error) {

                console.dir(error)

            }.bind(this))
            .finally(function(){

              this.loading = false

            }.bind(this))

      },

      submitParent: function(){

        this.$emit( 'submitParent' , this.index );

      }


  },
  filters:{

    number_format : function (value) {
        let formatter = new Intl.NumberFormat('ja-JP');
        return formatter.format(value);
    },

  },
};
</script>
<style>
[card-content]{
   border-radius: 8px;
  filter: drop-shadow(1px 1px 5px rgba(128,128,128,0.6));background: #FFF;cursor: pointer;
}
[card-content] img{width: 100%;object-fit: cover;border-radius: 8px 8px 0 0;display: block;}
[detail-box]{
  padding: 1em;position: relative;
}
[card-content] [detail-box] p{font-size: min(3.2vmin,14px); color: #222;}


/****************************/
[edit-product-dialog]{
  position: absolute;
  width: 80%;
  height: 80%;
}





</style>
