import axios from 'axios'

export const state = () => ({
     profile : '',
     regist  : '',
     buyerData   : '',
})

export const getters = {

	userProfile: state => {

   		return state.profile

	},
  userRegist: state => {

      return state.regist

  },
  buyer: state => {

      return state.buyerData

  },


}

export const actions = {

  setProfile ( { commit  } , value ) {

    commit('setUserProfile',  value )

  },
  setRegist ( { commit  } , value ) {

    commit('setUserRegist',  value )

  },
  setBuyer ( { commit  } , value ) {

    commit('setBuyerData',  value )

  },

}


export const mutations = {

  setUserProfile (state,  value ) {

    state.profile = value

  },
  setUserRegist (state,  value ) {

    state.regist = value

  },
  setBuyerData (state,  value ) {

    state.buyerData = value

  },
}
