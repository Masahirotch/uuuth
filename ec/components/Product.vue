<template>
  <transition name="el-fade-in-linear">
		<div>

      <section class="product__wrapper">
        <div class="product__image">
          <swiper :options="swiperOption">
              <swiper-slide v-for="item in productThumb" v-if="item != null">
                  <img :src="item" class="swiper-lazy">
              </swiper-slide>
              <div slot="pagination" class="swiper-pagination"/>
          </swiper>
        </div>

        <div class="product__explanation">
          <h2 class="product__title">{{item.product_name_no_size}}</h2>
          <p class="product__text">
            {{ item.product_subname }}
          </p>

          <div class="product__purchase-unit">
            <div class="product__price">{{item.price|number_format}}円/{{item.product_unit}}（税込）</div>

            <div class="button__wrapper">
              <button type="button" class="button__inc-dec" @click="cartOut" :disabled="!productQuantity">
                <img src="/img/icon/icon_minus.svg" alt="減らす"/>
              </button>
              <button type="button" class="button__number" :class="{notZero:productQuantity > 0}">{{productQuantity|number_format}}</button>
              <button type="button" class="button__inc-dec" @click="cartIn">
                <img src="/img/icon/icon_plus.svg" alt="増やす" />
              </button>
            </div>
          </div>

          <dl class="product__detail">
            <el-collapse accordion class="product__detail">
              <el-collapse-item title="商品詳細" class="product__detail-title">
                <div v-html="nl2br(item.product_description)"></div>
              </el-collapse-item>
            </el-collapse>
          </dl>

        </div>
      </section>

		</div>
  </transition>
</template>

<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'

export default {

    mixins:[util],

    props : ['item'],

    data() {

        return {

            activeNames: [],

            ////////////////////
            swiperOption: {

                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                },

                pagination: {
                  el: '.swiper-pagination',
                  clickable: true,
                  type : 'bullets'
                },

                slidesPerView: 1,

                loop: true,

            },

        }

    },
    mounted(){

        console.dir(this.item)

    },
    computed: {

        productThumb(){

          var data_image = [];

          if(this.item.main?.file_id != null){
            data_image.push(this.item.main.thumb_url);
          }

          if(this.item.pict2?.file_id != null){
            data_image.push(this.item.pict2.thumb_url);
          }

          if(this.item.pict3?.file_id != null){
            data_image.push(this.item.pict3.thumb_url);
          }

          if (data_image.length == 0){
            data_image.push(process.env.DUMMY_THUMB_IMAGE);
          }

          return data_image;

        },

        isArticle : function(){

            return ( this.item.article_id != void 0 && this.item.article_id > 0 && this.item.article != void 0 )? true : false

        },

        isShowArticleLink: function () {
          return process.env.SHOW_ARTICLE_LINK?.toLowerCase() == 'true';
        },


        productQuantity(){
          const thisProduct = this.cart.find( element => Number( element.product_id ) == Number(this.item.product_id) )
          return (thisProduct ? thisProduct.quantity : 0)
        },

        ...mapGetters( 'config'  ,['config'] ),
        ...mapGetters( 'user'    ,['userProfile','userConfig','userShipping','history'] ),
        ...mapGetters( 'cart'    ,['cart','cartCount','session_id' , 'orderMethod' , 'stripeToken' , 'delivery' ] ),
        ...mapGetters( 'products',['products','shippingTable','constPref'] ),

    },
    methods:{
        ...mapActions('config'  ,['setConfig']),
        ...mapActions('user'    ,['setUserProfile','setUserConfig','setUserShipping','setHistory']),
        ...mapActions('cart'    ,[ 'plusCart' , 'minusCart' , 'clearCart' , 'setSession' , 'cartInit' , 'setOrderMethod' , 'setStripeToken','setDelivery' ]),
        ...mapActions('products',['setProducts','setShippingTable','setConstPref','getProductsByIds']),

        plusTax : function(val){

            return +val + Math.ceil(val * 0.08)

        },

        ///////////////////////////////////////////////////////////////////
        cartIn : async function(){

            var plusItem = JSON.parse( JSON.stringify( this.item ) )
            const prds = await this.getProductsByIds({ ids: plusItem.product_id, appId: this.config.app_id });
            const product = prds.find((p) => p.product_id === plusItem.product_id)
            var cartInItem = {
                product_id      : plusItem.product_id,
                product_name    : plusItem.product_name,
                product_code    : plusItem.product_code,
                price           : plusItem.price,
                quantity        : 1,
                size_code       : plusItem.size_code,
                product_unit    : plusItem.product_unit,
                thumb_url       : product ? product.main?.thumb_url : null
            }

            this.plusCart(cartInItem)

            if( liff.getOS() != 'ios' ){

                window.navigator.vibrate(100)

            }

        },
        cartOut : function(){

          var outItem = JSON.parse( JSON.stringify( this.item ) )
          var cartOutItem = {
            product_id             : outItem.product_id,
          }

          this.minusCart(cartOutItem)

          if( liff.getOS() != 'ios' ){

            window.navigator.vibrate(100)

          }

        },
///////////////////////////////////////////////////////////////////


        goArticle : function(){

            this.$router.push( '/article/' + this.item.article_id )

        },





    },
    filters:{

        number_format : function (value) {
            let formatter = new Intl.NumberFormat('ja-JP');
            return formatter.format(value);
        },

        article_category : function(value){

            if( value == 1 ) return 'この商品の生産者情報'
            if( value == 2 ) return 'この商品を使ったレシピ情報'
            if( value == 3 ) return 'レストランでこの商品を食べる'

        }

    },


};
</script>

<style>
/* 商品一覧 */
.product__wrapper {
  overflow: hidden;
  margin-bottom: 12px;
  background-color: var(--whiteColor);
  border: 1px solid var(--grayColor);
  border-radius: 8px;
}
.product__image {
  position: relative;
}
.product__image img {
  width: 100%;
  max-width: none;
}
.product__explanation {
  border-top: 1px solid var(--grayColor);
  padding: 44px 12px 12px;
}
.product__title {
  font-size: 1.34em;
  line-height: 1.2em;
}
.product__text {
  margin: 12px 0;
  font-size: 0.8em;
}
.product__purchase-unit {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}
.product__price {
  font-weight: bold;
}
.product__detail {
  border-top: 1px solid var(--grayColor);
}
.product__detail-title {
  position: relative;
  padding: 0.7em 1.5em 0;
  font-weight: bold;
  transition: padding-bottom 0.3s;
}
.product__detail-title.open {
  padding-bottom: 0.5em;
}
.product__detail-title::before {
  content: "";
  position: absolute;
  top: 1.375em;
  left: 0;
  width: 0.85em;
  height: 2px;
  background-color: var(--subColor);
}
.product__detail-title::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 0.5em;
  transform: translateY(-15%) rotate(45deg);
  width: 0.6em;
  height: 0.6em;
  border-right: 2px solid var(--blackColor);
  border-bottom: 2px solid var(--blackColor);
  transition: transform .3s;
}
.product__detail-title.open::after {
  transform: translateY(-20%) rotate(225deg);
}
.product__detail-explanation {
  overflow: hidden;
  height: 0;
  padding-left: 1.5em;
  font-size: 0.8em;
  transition: height .4s;
}
/* Swiper */
.product__image .swiper-pagination.swiper-pagination-bullets {
  bottom: -24px;
}
.product__image .swiper-pagination-bullet {
  border-radius: 1px;
  width: 20px;
  height: 5px;
}
.product__image .swiper-pagination-bullet-active {
  background-color: var(--subColor);
}

.product__detail.el-collapse {
  border-top: 1px solid var(--grayColor);
  border-bottom: none;
}
.product__detail-title.el-collapse-item {
  position: relative;
  padding: 0.7em 0 0 1.5em;
  font-weight: bold;
  transition: padding-bottom 0.3s;
}
.product__detail-title.el-collapse-item:last-child {
  margin-bottom: 0;
}
.product__detail-title.el-collapse-item::before {
  content: "";
  position: absolute;
  top: 1.375em;
  left: 0;
  width: 0.85em;
  height: 2px;
  background-color: var(--subColor);
}
.product__detail-title.el-collapse-item::after {
  content: "";
  position: absolute;
  top: 1.1em;
  right: 0.5em;
  transform: translateY(-15%) rotate(45deg);
  width: 0.6em;
  height: 0.6em;
  border-right: 2px solid var(--blackColor);
  border-bottom: 2px solid var(--blackColor);
  transition: transform .3s;
}
.product__detail-title.el-collapse-item.is-active::after {
  transform: rotate(225deg);
}
.product__detail .el-collapse-item__arrow {
  display: none;
}
.product__detail .el-collapse-item__header {
  display: block;
  height: auto;
  padding-right: 1.5em;
  color: inherit;
  border-bottom: none;
  font-size: 1em;
  font-weight: bold;
  line-height: inherit;
}
.product__detail .el-collapse-item__header.is-active {
  padding-bottom: 0.5em;
}
.product__detail .el-collapse-item__wrap {
  border-bottom: none;
}
.product__detail .el-collapse-item__content {
  padding-bottom: 0;
  color: var(--blackColor);
  font-size: 1em;
  font-weight: normal;
  line-height: 1.5em;
}

/* Swiper */
.swiper-container {
  overflow-x: hidden;
  position: static;
}
.swiper-pagination-bullets {
  bottom: -24px;
}
.swiper-pagination-bullet {
  border-radius: 1px;
  width: 20px;
  height: 5px;
}
.swiper-pagination-bullet-active {
  background-color: #F0A10C;
}
</style>
