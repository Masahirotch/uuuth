import axios from 'axios'

export const state = () => ({
     userProfile  : '',
     userConfig   : '',
     history      : '',
})

export const getters = {

  userProfile: state => {

    return state.userProfile

  },
  userConfig: state => {

    return state.userConfig

  },
  history: state => {

    return state.history

  },

}

export const actions = {

  setUserProfile ({ commit  } ,  value  ) {

    commit('setUserProfileData',  value )

  },
  setUserConfig ({ commit  } ,  value  ) {

    commit('setUserConfigData',  value )

  },
  setHistory ({ commit  } ,  value  ) {

    commit('setHistoryData',  value )

  },


}

export const mutations = {

  setUserProfileData ( state , value ) {

     state.userProfile = value

  },
  setUserConfigData ( state , value ) {

     state.userConfig = value

  },
  setHistoryData ( state , value ) {

     state.history = value

  },


}
