import axios from 'axios'

export default function({ store, redirect, route }){

  //console.dir('auth')
  console.dir(route)
  //console.dir(store.getters['config/config'])

  // app_idがない場合、ホームにリダイレクト。
  if ( store.state.user.userProfile == '' && route.name != 'index'  ){

    const pattern = /(api|complete)/;

/*
    if( !pattern.test( route.name ) ){

        return redirect({

          path: '/'

        })

    }

*/

  }

}

