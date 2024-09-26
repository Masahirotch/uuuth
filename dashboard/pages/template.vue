<template>
    <div center full>
        <NuxtLink to="/main/"></NuxtLink>
        <Loader :text="text" v-if="loading" />
    </div>
</template>
<script>
import axios from 'axios'
import { mapState , mapGetters, mapActions } from 'vuex'
export default {

    data: () => {
        return {

            loading : true,
            text    : '読み込み中...'

        }
    },
    created(){

    },
    mounted : function(){
  //console.clear()

        this.loading = false


        var params = new FormData()
        params.append( 'action'   , 'chengeProductStatus' )
        params.append( 'data'     , '!!!!!' )
        axios.post('https://'+process.env.APP_URL+'/API/?q=bar' , params )
            .then( function(result){

              console.dir(result)


            }.bind(this))
            .catch((err) => {

                console.dir(err)

            })
            .finally(function(){

                this.loading = false

            }.bind(this))


/*


            var params = new FormData();

            axios.post( '' , params )
                .then( function(result){

                    console.dir(result.data)

                }.bind(this))
                .catch((err) => {

                    console.dir(err)

                })
                .finally(function(){

                    this.loading = false

                }.bind(this))
*/


    },

    computed: {
        ...mapGetters( 'admin' , ['adminUser']),
    },
    methods:{
        ...mapActions( 'admin' , ['setAdminUser']),



    },

};
</script>
<style>
</style>
