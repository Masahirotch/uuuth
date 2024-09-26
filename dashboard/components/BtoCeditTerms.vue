<template>
    <div>

        <dl dl-terms>
            <dd>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 8, maxRows: 16}"
                  v-model="terms.terms">
                </el-input>
            </dd>
        </dl>

    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    props : [ 'terms' ],

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