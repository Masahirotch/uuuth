import axios from 'axios'

export const state = () => ({
     appConfig  : '',
     article_id : '',
     app_code   : '',

})

export const getters = {

  appConfig: state => {

    return state.appConfig

  },

  article_id: state => {

    return state.article_id

  },

  app_code: state => {

    return state.app_code

  },



}

export const actions = {

  setAppConfig ({ commit  } ,  value  ) {

    commit('setAppConfigData',  value )

  },

  set_article_id ({ commit  } ,  value  ) {

    commit('set_article_id_data',  value )

  },

  set_app_code ({ commit  } ,  value  ) {

    commit('set_app_code_data',  value )

  },

}

export const mutations = {

  setAppConfigData ( state , value ) {

     state.appConfig = value

  },

  set_article_id_data ( state , value ) {

     state.article_id = value

  },

  set_app_code_data ( state , value ) {

     state.app_code = value

  },

}
