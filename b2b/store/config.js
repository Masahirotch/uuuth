import axios from 'axios'

export const state = () => ({
    config      : '',
    products    : '',
    userProfile : '',
    units       : '',
    favorites   : '',
    delivConfig : '',
})

export const getters = {

    config : state => {

        return state.config

    },

    products : state => {

        return state.products

    },

    userProfile : state => {

        return state.userProfile

    },

    units : state => {

        return state.units

    },

    favorites : state => {

        return state.favorites

    },

    delivConfig : state => {

        return state.delivConfig

    },

}

export const actions = {

    setConfig ({ commit  } ,  value  ) {

        commit('setConfigData',  value )

    },

    setProducts ({ commit  } ,  value  ) {

        commit('setProductsData',  value )

    },

    setUserProfile ({ commit  } ,  value  ) {

        commit('setUserProfileData',  value )

    },

    setUnits ({ commit  } ,  value  ) {

        commit('setUnitsData',  value )

    },

    setFavorites ({ commit  } ,  value  ) {

        commit('setFavoritesData',  value )

    },

    setDelivConfig ({ commit  } ,  value  ) {

        commit('setDelivConfigData',  value )

    },

}

export const mutations = {

  setConfigData ( state , value ) {

     state.config = value

  },

  setProductsData ( state , value ) {

     state.products = value

  },

  setUserProfileData ( state , value ) {

     state.userProfile = value

  },

  setUnitsData ( state , value ) {

     state.units = value

  },

  setFavoritesData ( state , value ) {

     state.favorites = value

  },

  setDelivConfigData ( state , value ) {

     state.delivConfig = value

  },

}