<template>
    <div>

        <dl dl-terms>
            <dt>総則</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="privacy.privacy_header">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>1. お客様情報について</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="privacy.privacy_information">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>2. お客様情報の利用目的について</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="privacy.privacy_purpose">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>3. お客様情報の第三者への委託について</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="privacy.privacy_consign">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>4. お客様情報の第三者への提供について</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="privacy.privacy_furnishing">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>5. LINEユーザーデータの使用について</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="privacy.privacy_line">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>6. お客様情報のお問い合わせについて</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="privacy.privacy_contact">
                </el-input>
            </dd>
        </dl>








    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'privacy' ],

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