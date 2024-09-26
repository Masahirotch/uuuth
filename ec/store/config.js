import axios from 'axios'

export const state = () => ({
    config : '',
})

export const getters = {

  config: state => {

    return state.config

  },

}

export const actions = {

  setConfig ({ commit  } ,  value  ) {

    commit('setConfigData',  value )

  },

}

export const mutations = {

  setConfigData ( state , value ) {

     state.config = value

  },

}