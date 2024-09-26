import axios from 'axios'

export const state = () => ({
     
     // アカウント管理用
     constPref   : '',
     appList     : '',

     // 商品管理用
     products    : '',

     // 受注リスト
     order : '',

     articles : '',


})

export const getters = {

    constPref: state => {

        return state.constPref

    },

    appList: state => {

        return state.appList

    },


    products: state => {

        return state.products

    },

    order : state => {

        return state.order

    },

    articles : state => {

        return state.articles

    },

}

export const actions = {

    setConstPref ( { commit  } , value ) {

        commit('setConstPrefData',  value )

    },

    setAppList ( { commit  } , value ) {

        commit('setAppListData',  value )

    },


    setProducts ( { commit  } , value ) {

        commit('setProductsData',  value )

    },

    setOrder ( { commit  } , value ) {

        commit('setOrderData',  value )

    },

    setArticles ( { commit  } , value ) {

        commit('setArticlesData',  value )

    },

}

export const mutations = {

    setConstPrefData ( state,  value ) {

        state.constPref = value

    },

    setAppListData ( state,  value ) {

        state.appList = value

    },

    setProductsData ( state,  value ) {

        state.products = value

    },

    setOrderData ( state,  value ) {

        state.order = value

    },

    setArticlesData ( state,  value ) {

        state.articles = value

    },

}