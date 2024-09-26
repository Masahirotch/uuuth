import axios from 'axios'

export const state = () => ({
     apps     : '',
     products : '',
     orders   : '',
     articles : '',


})

export const getters = {

	apps : state => {

   		return state.apps

	},
  products : state => {

      return state.products

  },
  orders : state => {

      return state.orders

  },
  articles : state => {

      return state.articles

  },


}



export const actions = {

  setApps ( { commit  } , value ) {

    commit('setAppsData',  value )

  },
  setProducts ( { commit  } , value ) {

    commit('setProductsData',  value )

  },
  setOrders ( { commit  } , value ) {

    commit('setOrdersData',  value )

  },
  setArticles ( { commit  } , value ) {

    commit('setArticlesData',  value )

  },

}

export const mutations = {

  setAppsData ( state,  value ) {

    state.apps = value

  },
  setProductsData ( state,  value ) {

    state.products = value

  },
  setOrdersData ( state,  value ) {

    state.orders = value

  },
  setArticlesData ( state,  value ) {

    state.articles = value

  },

}
