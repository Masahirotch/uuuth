import axios from 'axios'

export const state = () => ({
     pref            : '',
     city            : '',
     zip             : '',
})

export const getters = {

  pref: state => {

    return state.pref

  },

  city: state => {

    return state.city

  },

  zip: state => {

    return state.zip

  },



}

export const actions = {

  setPref ({ commit  } ,  value  ) {

    commit('setPrefData',  value )

  },

  setCity ({ commit  } ,  value  ) {

    commit('setCityData',  value )

  },

  setZip ({ commit  } ,  value  ) {

    commit('setZipData',  value )

  },



}

export const mutations = {

  setPrefData ( state , value ) {

     state.pref = value

  },

  setCityData ( state , value ) {

     state.city = value

  },

  setZip ( state , value ) {

     state.zip = value

  },













}
