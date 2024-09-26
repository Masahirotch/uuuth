export default function({ store, redirect, route }){

  console.dir('auth')
  console.dir( store.state )


/*
  // app_idがない場合、ホームにリダイレクト。
  if ( store.state.userProfile.user_id == '' && route.name != 'index' ){

    const pattern = /(api|complete)/;

    if( !pattern.test( route.name ) ){

        return redirect({

          path: '/'

        })

    }

  }

*/

}