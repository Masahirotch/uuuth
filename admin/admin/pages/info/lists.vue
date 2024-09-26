<template>
  <div>
    <Loader text="" v-if="loading" />

    <div page-content>

        <div menu-content>

            <LeftMenu />

        </div>

        <div main-content>
            <h2 content-header>メッセージリスト</h2>
            <div pr-2 pl-2 pb-5>

                <dl list-header>
                    <dt>内容</dt>
                    <dt>ターゲット</dt>
                    <dt>配信日時</dt>
                    <dt>編集日時</dt>
                </dl>

                <dl list-data v-for="(message , index) in messages">
                    <dd image-split>
                        <div><img :src="messageImage(message)" message-list-thumb></div>
                        <div>{{messageText(message)}}</div>
                    </dd>
                    <dd></dd>
                    <dd>{{message.lastSendDate}}</dd>
                    <dd>{{message.createDate}}</dd>
                </dl>

            </div>

        </div>

    </div>

  </div>
</template>

<script>
    import { mapState , mapGetters, mapActions } from 'vuex'
    import axios from 'axios'
    import LeftMenu from "@/components/LeftMenu"

export default {
    components: { LeftMenu },
    data() {
        return {
            loading : true,
            messages : [],
        }
    },
    created(){

        if(!this.login){

          this.$router.push('/')

        }

    },
    mounted(){

        this.getMessageList()

    },
    computed: {
        ...mapGetters( 'user' , ['userProfile','login']),
        ...mapGetters( 'info' , ['allParent']),
    },
    methods:{
        ...mapActions( 'user' , ['setProfile','setLogin']),
        ...mapActions( 'info' , ['setAllParent']),

        // メッセージ一覧を取得
        getMessageList : async function(){

            await axios.post( process.env.API_URL + 'getMessages' , {
                token: process.env.INFO_TOKEN,
            })
            .then( function (result){

                this.messages = result.data.messages

            }.bind(this))
            .catch( function(err){

                console.dir(err)

            }.bind(this))
            .finally(async function(){

                this.loading = false

            }.bind(this))

        },
        //
        messageImage : function(message){

            var target = message.messages.find( t => t.editor.image || t.editor.movie )

            // undefinedの場合
            if( !target ){

                return '/resource/no-image.png'

            }
            else{

                return target.previewImageUrl

            }

        },

        //
        messageText : function(message){

            var target = message.messages.find( t => t.editor.text )

            // undefinedの場合
            if( !target ){

                return ''

            }
            else{

                return target.text

            }


        }




    },

};
</script>
<style>
[list-header]{
    display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: center;
    background-color: #edeff0;
    border-top:1px solid #dee2e6;
    border-bottom:1px solid #dee2e6;
}
[list-data]{
    display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: center;
    border-bottom:1px solid #ccc;
    cursor: pointer;
}
[list-data]:hover{
    background:#fafafa;
}


[list-header] dt,[list-header] dd,
[list-data] dd,[list-data] dd{
    color: #495057;
    font-weight:600;
    padding:1em;
}
[list-header] dt:nth-of-type(1),[list-data] dd:nth-of-type(1){
    width:100%;
}
[list-header] dt:nth-of-type(2),
[list-header] dt:nth-of-type(3),
[list-header] dt:nth-of-type(4),
[list-data] dd:nth-of-type(2),
[list-data] dd:nth-of-type(3),
[list-data] dd:nth-of-type(4){
    width:15em;
}

[message-list-thumb]{
    width:80px;
    height:80px;
    object-fit:cover;
}
[image-split]{
    display: flex; flex-flow:row nowrap; justify-content: flex-start; align-items: flex-start;
}
[image-split] > *:nth-of-type(1){
    width:80px;
    margin-right:1em;
}










</style>
