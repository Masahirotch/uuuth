<template>
    <div>

        <dl dl-terms>
            <dt>販売価格について</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="laws.law_prices">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>代金(対価)の支払時期と方法</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="laws.law_method">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>返品についての特約事項</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="laws.law_returned">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>役務または商品の引き渡し時期</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="laws.law_service">
                </el-input>
            </dd>
        </dl>

        <dl dl-terms>
            <dt>その他</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="laws.law_other">
                </el-input>
            </dd>
        </dl>


        <dl dl-terms>
            <dt>事業者の名称および連絡先</dt>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4}"
                  v-model="laws.law_about">
                </el-input>
            </dd>
        </dl>









    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'laws' ],

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