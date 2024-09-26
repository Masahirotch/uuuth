<template>
    <div>
        <Menu />
        <Loader :text="text" v-if="loading" />

        <div page-content>


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
                        <dd>{{jpDay(message.lastSendDate)}}</dd>
                        <dd>{{jpDay(message.createDate)}}</dd>
                    </dl>

                </div>

            </div>

        </div>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'

var unserialize = require('locutus/php/var/unserialize')



export default {

    data: () => {
        return {

            loading : true,
            text    : '読み込み中...',
            messages : [],

        }
    },
    created(){

        console.clear()

    },
    mounted : function(){

        this.loading = false
        this.init()

    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),

        init :async function(){

            var messages = await this.getMessageList()
            await this.setMessages( messages )

        },

        // メッセージ一覧を取得
        getMessageList : async function(){

            var messages = ''

            var db = new URLSearchParams()
            return await axios.post( process.env.INFO_API + 'getMessages' , db ).then( async function(result){

                return await Promise.all( result.data.map( async ( m )=>{

                    var reg = /\"/g

                    return await {
                        ID            : m.ID,
                        createDate    : m.createDate,
                        delFlg        : m.delFlg,
                        inputDate     : m.inputDate,
                        inputTime     : m.inputDate,
                        lastSendDate  : m.lastSendDate,
                        reservation   : m.reservation,
                        sendDate      : m.sendDate,
                        mes           : m.mes,
                        des           : m.des,
                        messages      : unserialize( m.mes ) ,
                        destinationTo : unserialize( m.des )

                    }

                }))

            }.bind(this)).catch((err) => { console.dir(err); }).finally(function() {  }.bind(this));

        },

        setMessages : function( messages ){

            console.dir( messages )

            this.messages = messages

        },


        //
        messageImage : function(message){

            var msg = JSON.parse( JSON.stringify( message.messages ) )
            
            if( msg.find ){

                var target = msg.find( t => t.editor.image || t.editor.movie )

                if( !target ){

                    return '/dummy.jpg'

                }
                else{

                    return target.previewImageUrl

                }

            }

            else{

                return '/dummy.jpg'

            }

        },

        //
        messageText : function(message){

            var msg = JSON.parse( JSON.stringify( message.messages ) )
            
            if( msg.find ){

                var target = msg.find( t => t.editor.text )

                if( !target ){

                    return ''

                }
                else{

                    return target.text

                }

            }

            else{

                return ''

            }

        },

        /////////////////////////

        jpDay : function( day ){

            return this.$dayjs( day ).format( 'YYYY年MM月DD日 HH:mm' )

        },













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
