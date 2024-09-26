<template>
     <div app-edit>
        <label account-editor>
            <span>アカウント名</span>
            <el-input placeholder="" v-model="app.app_name"></el-input>
        </label>

        <label account-editor>
            <span>アカウントコード（半角英数のみ）</span>
            <el-input placeholder="" v-model="app.app_code"></el-input>
        </label>

        <label account-editor>
            <span>アカウントコード（半角英数のみ）</span>
            <el-input placeholder="" v-model="app.app_code"></el-input>
        </label>

        <label account-editor>
            <span>LIFF ID</span>
            <el-input placeholder="" v-model="app.liff_id"></el-input>
        </label>

        <label account-editor>
            <span>Channel ID</span>
            <el-input placeholder="" v-model="app.channel_id"></el-input>
        </label>

        <label account-editor>
            <span>Channel Secret</span>
            <el-input placeholder="" v-model="app.channel_secret"></el-input>
        </label>

        <label account-editor>
            <span>アクセストークン（長期）</span>
            <el-input type="textarea" :autosize="{ minRows: 3, maxRows: 5}" placeholder="" v-model="app.channel_access_token"></el-input>
        </label>

        <label account-editor>
            <span>取引先事業者名</span>
            <el-input placeholder="" v-model="app.client_name"></el-input>
        </label>

        <label account-editor>
            <span>店舗コード</span>
            <el-input placeholder="" v-model="app.client_code"></el-input>
        </label>

        <div update-button>
            <el-button type="primary" size="mini" @click="updateApp">更新</el-button>
            <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="deleteApp" ml-2i></el-button>
        </div>





    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'app' ],

    data() {

        return {


        }

    },
    watch:{


    },
    mounted(){


    },
    
    computed: {



        ...mapGetters( 'b2b2c' , ['apps' , 'products' , 'orders']),
    },
    methods:{
        ...mapActions( 'b2b2c' , ['setApps' , 'setProducts' , 'setOrders' ]),

        updateApp : function(){

            this.$emit( 'updateApp' , this.app )

        },

        deleteApp : function(){

            this.$confirm( `<p> アカウント「${this.app.app_name}」を削除しますか？<br>この操作は取り消せません<p>` , '削除しますか？', {
              confirmButtonText       : '削除する',
              dangerouslyUseHTMLString: true,
              cancelButtonText: 'キャンセル',
              type: 'error',
            })
            .then(() => {

                this.doDeleteApp()

            }).catch( () =>{});

              
        },

        doDeleteApp : function(){

            this.$emit( 'deleteApp' , this.app )

        },


    },
};
</script>
<style scoped>
label[account-editor]{
    width:100%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: flex-start;-ms-flex-pack: start;justify-content: flex-start;
    -webkit-align-items: stretch; -ms-flex-align:stretch; align-items:stretch;
}

label[account-editor] span{
    width:25em;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    padding-right:1.5em;
}
[app-edit]{
    position:relative;
}
[app-edit] > [update-button]{
    width:100%;
    display: -webkit-flex; display: -ms-flexbox; display: flex;
    -ms-flex-flow:row nowrap;flex-flow:row nowrap;
    -webkit-justify-content: flex-end;-ms-flex-pack: end;justify-content: flex-end;
    -webkit-align-items: center;  -ms-flex-align: center; align-items: center;
    padding:1em 3em 2em 0;
}


</style>