<template>
     <div class="sortable-item" sort-item>
        <div inner-content>
            <p v-if="isTexxt" v-html="nl2br(section.content)" style="padding-right:2.5em;font-size:9px;text-align:justify;"></p>
            <img :src="section.file.thumb_url" v-if="isFile" style="height:60px;">
        </div>
        <div delete-btn>
            <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="sectionDelete"></el-button>
        </div>
    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
import {util} from '../mixin/mixinUtils'

export default {

    mixins:[util],

    props : [ 'section' ],

    data() {

        return {


        }

    },
    watch:{


    },
    mounted(){



    },
    
    computed: {
        ...mapGetters( 'admin'   , ['adminUser']),
        ...mapGetters( 'article' , ['articles' ,'categories']),

        isTexxt : function(){

            return (this.section.type =='text')? true : false

        },
        isFile : function(){

            return (this.section.type !='text')? true : false

        },

    },

    methods:{
        ...mapActions( 'admin'   , ['setAdminUser']),
        ...mapActions( 'article' , ['setArticles' , 'setCategories']),

        sectionDelete : function(){
        
            if( this.section.type == 'text' ){

                var msg = '<p>' + this.nl2br( this.section.content ) + '</p>'

            }
            else{

                var msg = `<img src="${this.section.file.thumb_url}" style="height:60px;">`

            }

            this.$confirm(
                `${msg}`,
                '削除しますか？', {
                    confirmButtonText: '削除する',
                    cancelButtonText: 'キャンセル',
                    dangerouslyUseHTMLString: true,
                }).then(() => {

                    this.deleteAction()

                }).catch(() => {
                
                });
      
        },

        deleteAction : function(){

            this.$emit( 'sectionDelete' , this.section )

        },



    },
};
</script>
<style scoped>
[sort-item]{
    width:100%;
    margin: 0.3em 0;
    border:1px solid #CCC;
    padding:1em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap; flex-flow:row nowrap;
    -webkit-justify-content: center;-ms-flex-pack: center;justify-content: center;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    position:relative;
}

[sort-item]:hover{
    cursor:grab;
}
[sort-item]:active,[sort-item]:focus{
    cursor:grabbing;
}
[inner-content]{
    width:100%;
}

[delete-btn]{
    position:absolute;
    right:0.3em;
}





</style>