<template>
    <div full-height id="article-content" article-content>
        <Loading v-if="loading" />

        <div article-header>
            <img :src="headerImage">
            <div v-html="nl2br(article.article_title)" article-title></div>
        </div>

        <div publish-date>
            <span>{{publishDate}}</span>
        </div>

        <div sections v-for="section in sections">
            <div v-html="nl2br(section.content)" section-text v-if="isText(section.type)"></div>
            <img :src="imgSrc(section)" section-image v-if="isImage(section.type)">

            <video v-if="isMovie(section.type)" controls preload="none" :poster="moviePoster(section)">
                <source :src='movieSrc(section)' type='video/mp4'>
            <p>動画を再生するには、videoタグをサポートしたブラウザが必要です。</p>
            </video>

        </div>


        <div pl-5 pr-5 pt-3 pb-3>
            <span btn-default @click="goProducts">商品一覧へ</span>
            <span btn-default @click="closeApp" mt-2i>閉じる</span>
        </div>



        <Footer @cartToggle="cartToggle" style="margin-left:2em;" />

        <el-drawer
          title="現在のカートの中"
          :visible.sync="drawer"
          :direction="direction">    
          <Cart />
        </el-drawer>

    </div>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/Loading'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../../mixin/mixinUtils'

/*

https://hiyoshi.ec.line.cx/?app=hiyoshi&article=1
*/

export default {
    components: { Loading },
    mixins:[util],
    data: () => {
        return {
            loading: true,
            //////////
            drawer: false,
            direction: 'btt',

            article  : '',

            sections : '',
            
        }
    },
    mounted(){

        if( this.$route.params.article_id != void 0 &&  this.$route.params.article_id != '' && this.$route.params.article_id > 0 ){

            this.getArticle()

        }
        else{

            this.loading = false

        }

    },
    computed: {

        headerImage : function(){

            return ( this.article != void 0 && this.article.main != void 0 )? this.article.main[0].file_url : ''

        },

        publishDate : function(){

            return ( this.article != void 0 && this.article.publish_date != void 0 )? this.$dayjs( this.article.publish_date ).format('YYYY.MM.DD') : '---'

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
        ...mapActions('products',['setProducts','setShippingTable','setConstPref']),

        /* 記事の取得
        ******************************************************/
        getArticle : function(){

            var article_id = this.$route.params.article_id

            var db = new URLSearchParams()
            db.append( 'article_id' , article_id )
            axios.post( process.env.API + 'getArticleById' , db ).then( function(result){

                console.dir('getArticle')
                console.dir(result.data)
                this.article  = result.data
                this.sections = result.data.sections

            }.bind(this))
            .catch((err) => { console.dir(err); })
            .finally(function(){  

                this.loading = false

            }.bind(this))

        },




        cartToggle : function(){

            this.drawer = !this.drawer

        },





        isText : function(type){

            return ( type == 'text')? true : false 

        },

        isImage : function(type){

            return ( type == 'image')? true : false 

        },

        isMovie : function(type){

            return ( type == 'movie')? true : false 

        },

        imgSrc : function(section){

            return section.file.file_url

        },

        movieSrc : function(section){

            return section.file.file_url

        },

        moviePoster : function(section){

            return section.file.thumb_url

        },

        closeApp : function(){

            liff.closeWindow()

        },

        goProducts : function(){

            this.$router.push('/products/')

        },




    },

}
</script>
<style>
#article-content{
    width:100%;
}

[article-header]{
    width:100%;
    position:relative;
}
[article-header] img{
    width:100%;
    max-width:100%;
    display:block;
    object-fit:cover;
}

[article-title]{
    background:rgba(255,255,255,0.8);
    color:#222;
    position:absolute;
    bottom:1.5em;
    left:0;
    padding:0.6em;
    font-size:14pxx;
    font-weight:600;
}



[publish-date]{
    text-align:right;
    padding:0.5em;
}
[publish-date] span{font-size:14px;color:var(--text-color);}

[sections]{width:100%;max-width:500px;padding:1em 0;}
[sections] [section-text]{padding:0 1em;text-align:justify;font-size:15px;color:var(--text-color);}
[sections] img,[sections] video{width:100%;object-fit:cover;display:block;}

[article-content]{padding-bottom:3em;}

</style>
