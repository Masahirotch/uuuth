export const state = () => ({

  loggedIn : false

})

export const mutations = {

  setLogin( state ) {

    state.loggedIn = true

  },
  setLogout( state ) {

    state.loggedIn = false

  }

}
