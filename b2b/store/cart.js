import axios from 'axios'

export const state = () => ({
     cart        : [],
     cartCount   : 0,
     session_id  : '',
})

export const getters = {

    cart : state => {

        return state.cart

    },

    session_id : state => {

        return state.session_id

    },

    cartCount : state => {

      if (!state.cart) return 0
      return state.cart.reduce((sum, c) => sum + c.quantity, 0)

    },

}

export const actions = {

    setCart ({ commit  } ,  value  ) {

        commit('setCartData',  value )

    },

    clearCart ({ commit  }) {

        commit('clearCartData')

    },

    setSession ({ commit  } ,  value  ) {

        commit('setSessionData',  value )

    },


}

export const mutations = {

    setCartData ( state , value ) {

        state.cart = value

    },

    setSessionData ( state , value ) {

        state.session_id = value

    },

    clearCartData ( state ) {

        state.cart       = []
        state.cartCount  = 0
        state.session_id = ''
   
    },

}


