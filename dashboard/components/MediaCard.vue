<template>
    <el-card article-card :body-style="{ padding: '0px' }" style="max-width:300px;margin:0 auto;">
      <img :src="src">
      <div style="padding: 1em;">
        <span article-title v-html="nl2br(cardtext)"></span>
      </div>
    </el-card>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'
export default {

    mixins:[util],

    props : [ 'content' , 'cardtext' ],

    data() {

        return {


        }

    },
    watch:{


    },
    mounted(){



    },
    
    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref']),

        src : function(){

            return this.content.main_image.thumb_url

        },

    },

    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref']),

    },
};
</script>
<style>
[article-card] .el-card__body{padding:0 !important;}
[article-card] img{width:100%;}
[article-title]{font-weight:bold;}
[article-title] p{text-align:center;}




</style>