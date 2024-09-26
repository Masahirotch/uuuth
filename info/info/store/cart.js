import axios from 'axios'

export const state = () => ({
     cart : '',
     carts : [],
     allNum  : 0,
})

export const getters = {

  cart: state => {

      return state.cart

  },
  carts: state => {

      return state.carts

  },
  cartNum : state => {

      return state.allNum

  },

}

export const actions = {

  setCart ( { commit  } , value ) {

    commit('setCartData',  value )

  },

  setCarts ( { commit  } , value ) {

    commit('setCartsData',  value )

  },

  addUpCart ( { commit  } , value ) {

    commit('addUpCartData', value  )

  },

  cutDownCart ( { commit  } , value ) {

    commit('cutDownCartData', value  )

  },
  resetCart ( { commit  } ) {

    commit( 'resetCartData'  )

  },
  inputToCart ({ commit }, value) {
    commit('inputToCartData', value  )
  },
}

export const mutations = {

  setCartData (state,  value ) {

    state.cart = value

  },

  setCartsData (state,  value ) {

    state.carts = value

  },

  addUpCartData ( state,  value ) {

    state.carts.find( function(element){

      if ( element.productId == value ){

        //在庫あり商品
        if(element.isMax == 1){

          if( element.stock > 0 ){

            element.stock--
            element.quantity++

          }

        }
        else{

          element.quantity++

        }

      }

    });

    var cart_quantity = 0

    state.carts.forEach( function(e){

      cart_quantity += +e.quantity

    })

    state.allNum = cart_quantity

  },


  cutDownCartData ( state,  value ) {

    state.carts.find( function(element){

      if ( element.productId == value && element.quantity > 0){

        if(element.isMax == 1){
          element.stock++
        }

        element.quantity--

      }

    });

    var cart_quantity = 0

    state.carts.forEach( function(e){

      // Number(str) で文字列を数値に変換するのと +str は同じ
      cart_quantity += +e.quantity

    })

    state.allNum = cart_quantity

  },

  resetCartData (state,  value ) {

    state.carts.forEach( function(e){

      e.quantity = 0

    })

    state.allNum = 0

  },
  inputToCartData (state, value) {
    let {productId, newQuantity, input} = value;

    if (newQuantity > 1000) newQuantity = 999;

    state.carts.forEach (function (element) {
      if (element.productId == productId) {
        if (newQuantity < 0) {
          input.value = element.quantity;
          return;
        }
        // 在庫あり商品
        updateCartStockAndQuantity(element, newQuantity, input)
      }
    });

    let cart_quantity = 0
    state.carts.forEach( function(e){
      cart_quantity += +e.quantity
    })
    state.allNum = cart_quantity
  }
}

// 在庫あり商品
const updateCartStockAndQuantity = (element, newQuantity, input) => {
  if (element.isMax == 1) {
    const sub = newQuantity - element.quantity;
    if (element.stock > 0 && sub >= element.stock) {
      input.value = element.stock + element.quantity;
      element.quantity += element.stock;
      element.stock = 0;
    } else if (element.stock > 0 && sub < element.stock) {
      element.stock -= sub
      element.quantity = newQuantity
    }
  } else {
    element.quantity = newQuantity;
    input.value = newQuantity;
  }
}
