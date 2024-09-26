import axios from 'axios'

export const state = () => ({

     article   : '',
     articles  : '',

})

export const getters = {

  article: state => {

    return state.article

  },
  articles: state => {

    return state.articles

  },

}



export const actions = {

  setArticle ({ commit  } ,  value  ) {

    commit('setArticleData',  value )

  },

  setArticles ({ commit  } ,  value  ) {

    commit('setArticlesData',  value )

  },


}



export const mutations = {

  setArticleData ( state , value ) {

     state.article = value

  },
  setArticlesData ( state , value ) {

     state.articles = value

  },


}