import axios from 'axios'

export const state = () => ({
     allParent : '',

})

export const getters = {

	allParent: state => {

   		return state.allParent

	},

}



export const actions = {

  setAllParent ( { commit  } , value ) {

    commit('setAllParentData',  value )

  },

}

export const mutations = {

  setAllParentData ( state,  value ) {

    state.allParent = value

  },



}
