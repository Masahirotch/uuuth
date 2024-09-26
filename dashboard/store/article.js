import axios from 'axios'

export const state = () => ({

     articles   : '',
     categories : '',
     apps       : '',

})

export const getters = {

	articles: state => {

   		return state.articles

	},

  categories: state => {

      return state.categories

  },

  apps: state => {

      return state.apps

  },

}

export const actions = {

  setArticles ( { commit  } , value ) {

    commit('setArticlesData',  value )

  },

  setCategories ( { commit  } , value ) {

    commit('setCategoriesData',  value )

  },

  setApps ( { commit  } , value ) {

    commit('setAppsData',  value )

  },

}

export const mutations = {

  setArticlesData ( state,  value ) {

    state.articles = value

  },

  setCategoriesData ( state,  value ) {

    state.categories = value

  },

  setAppsData ( state,  value ) {

    state.apps = value

  },

}
