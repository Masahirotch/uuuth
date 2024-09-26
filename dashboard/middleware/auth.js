export default ({ store, redirect, route }) => {

  // ログインしていない場合ホームにリダイレクト。
  if ( !store.state.loggedIn && route.name != 'index' && route.name != 'admin-addAdmin' ){

    return redirect({

      path: '/'

    })

  }

}
