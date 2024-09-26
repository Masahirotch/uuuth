import axios from 'axios'

export const state = () => ({
     profile : '',
     login   : false,
})

export const getters = {

	userProfile: state => {

   		return state.profile

	},
  login: state => {

      return state.login

  },


}

export const actions = {

  setProfile ( { commit  } , value ) {

    commit('setUserProfile',  value )
  
  },
  setLogin ( { commit  } , value ) {

    commit('setLoginData',  value )
  
  },



}

export const mutations = {

  setUserProfile ( state,  value ) {

    state.profile = value

  },
  setLoginData ( state,  value ) {

    state.login = value

  },


}