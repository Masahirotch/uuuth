<template>
    <div>
        <dl dl-half>
            <dt required-label>アカウント名</dt>
            <dd><el-input placeholder="アカウント名" v-model="newApp.app_name"></el-input></dd>
            <dt required-label>アカウントID (半角英字のみ)</dt>
            <dd><el-input placeholder="アカウントID" v-model="newApp.app_code"></el-input></dd>
        </dl>

        <dl dl-half>
            <dt>ロゴ<br><b style="color:#F00;">[注意！] すぐに更新されます</b></dt>
            <dd>
                <FileUploader 
                    maxByte       = "512000"
                    thumbSize     = "200"
                    @uploadFile   = "uploadFile"
                    :currentImage = "newApp.thumb"
                    :index        = "newApp.app_id" />
            </dd>

            <dt>テーマカラー</dt>    
            <dd>
                <select select-theme v-model="newApp.theme_id">
                    <option disabled>選択</option>
                    <option value="1">テーマ 1</option>
                    <option value="2">テーマ 2</option>
                </select>
                <span>▼</span>
            </dd>
        </dl>

        <dl>
            <dt>MESSAGING API<br>チャネルシークレット</dt>
            <dd><el-input placeholder="" v-model="newApp.msg_channel_secret"></el-input></dd>
        </dl>

        <dl>
            <dt>MESSAGING API<br>チャネルシークレット</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  placeholder=""
                  v-model="newApp.msg_access_token">
                </el-input>
            </dd>
        </dl>


        <dl>
            <dt>配送可能エリア / 配送料</dt>
            <dd>
                 <div pref-loop>
                    <div atm-prefshipping v-for="pref in newApp.shipping">
                        <label>
                          <span>{{pref.jp}}</span>
                          <el-switch v-model="pref.config.shipping_flg"></el-switch>
                        </label>
                        <label>
                          <span>送料</span>
                          <el-input v-model="pref.config.shipping_fee" placeholder="0" maxlength="5" class="shipping-edit" :disabled="!pref.config.shipping_flg"></el-input>
                        </label>
                    </div>

                </div>
            </dd>
        </dl>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [  ],

    data() {

        return {

            newApp : {

                app_name : '',
                app_code : '',
                msg_channel_secret : '',
                msg_access_token   : '',
                theme_id           : '',
                logo_gid           : '',
                thumb              : ''
            }

        }

    },
    watch:{


    },
    mounted(){



    },
    
    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
        ...mapGetters( 'b2c'   , ['constPref' , 'salesAccounts' ]),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),
        ...mapActions( 'b2c'   , ['setConstPref' , 'setSalesAccounts' ]),




    },
};
</script>
<style>

</style>