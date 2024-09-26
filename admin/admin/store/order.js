import axios from 'axios'

export const state = () => ({
     order : '',

})

export const getters = {

	order : state => {

   		return state.order

	},

}



export const actions = {

  setOrder ( { commit  } , value ) {

    commit('setOrderData',  value )

  },

}

export const mutations = {

  setOrderData ( state,  value ) {

    state.order = value

  },



}
