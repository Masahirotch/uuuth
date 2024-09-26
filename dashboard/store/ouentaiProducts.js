import axios from 'axios'

export const state = () => ({
     products : [],
})

export const getters = {

  products: state => {

      return state.products

  },


}

export const actions = {

  setProducts ( { commit  } , value ) {

    commit('setProductsData',  value )
  
  }


}

export const mutations = {

  setProductsData (state,  value ) {

    state.products = value

  },

}
