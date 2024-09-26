import axios from 'axios'

export const state = () => ({
     cart : [],
     cartCount : 0,
     session_id : '',
     orderMethod : '',
     stripeToken : '',
     delivery    : '',
})

export const getters = {

  cart: state => {

    return state.cart

  },
  cartCount: state => {

    return state.cartCount

  },
  session_id: state => {

    return state.session_id

  },
  orderMethod : state => {

    return state.orderMethod

  },
  stripeToken : state => {

    return state.stripeToken

  },
  delivery : state => {

    return state.delivery

  },
}

export const actions = {

  plusCart ({ commit  } ,  value  ) {

    commit('setPlusCartData',  value )

  },
  minusCart ({ commit  } ,  value  ) {

    commit('setMinusCartData',  value )

  },
  clearCart ({ commit  }) {

    commit('clearCartData')

  },
  setSession ({ commit  } ,  value  ) {

    commit('setSessionData',  value )

  },
  cartInit ({ commit  } ,  value  ) {

    commit('cartInitData',  value )

  },
  setOrderMethod ({ commit  } ,  value  ) {

    commit('setOrderMethodData',  value )

  },
  setStripeToken ({ commit  } ,  value  ) {

    commit('setStripeTokenData',  value )

  },
  setDelivery ({ commit  } ,  value  ) {

    commit('setDeliveryData',  value )

  },

}

export const mutations = {

  setPlusCartData ( state , value ) {

      // カートに何も入っていない場合
      if( state.cart == '' ){

          state.cart.push( value )
          state.cartCount += value.quantity

      }
      // カートに商品が入っている場合
      else{

          // 同じ商品がすでにカートにある場合は、商品数を増やす
          var chk = state.cart.find( element => Number( element.product_id ) == Number(value.product_id) )
          if( chk ){

            chk.quantity += value.quantity

          }

          // 同じ商品がない場合は追加
          else{

            state.cart.push( value )

          }

          state.cartCount += value.quantity

      }//else

      console.dir( state.cart )
      console.dir( state.session_id )

      // cart sessionを更新
      var db = new URLSearchParams()
      db.append( 'session_id'     , state.session_id )
      db.append( 'cart'           , JSON.stringify( state.cart )  )
      db.append( 'userProfile'    , JSON.stringify( this.getters['user/userProfile'] )  )
      axios.post( process.env.MAIN_API + '/setCartSession' , db ).then( function(result){

          this.dispatch( 'cart/setSession' , result.data )

      }.bind(this))
      .catch((err) => { console.dir(err); })
      .finally(function(){}.bind(this))

  },

  setMinusCartData ( state , value ) {

      state.cartCount -= 1

      // カートに何も入っていない場合
      if( state.cart == '' ){

        return

      }
      // カートに商品が入っている場合
      else{

          // 同じ商品がすでにカートにある場合は、商品数を減らす
          var chk = state.cart.find( element => Number( element.product_id ) == Number( value.product_id ) )

          if( chk ){

              if( chk.quantity == 1 ){

                var deleteItem = state.cart.filter( element => Number(element.product_id) == Number(chk.product_id) )

                // cart sessionにて削除アイテムを削除
                var db = new URLSearchParams()
                db.append( 'session_id'     , state.session_id )
                db.append( 'cart'           , JSON.stringify( deleteItem )  )
                db.append( 'userProfile'    , JSON.stringify( this.getters['user/userProfile'] )  )
                axios.post( process.env.MAIN_API + '/deleteCartSession' , db ).then( function(result){

                    this.dispatch( 'cart/setSession' , result.data)

                }.bind(this))
                .catch((err) => { console.dir(err); })
                .finally(function(){}.bind(this))

                // カートを更新
                var newCart = state.cart.filter( element => Number(element.product_id) != Number(chk.product_id) )
                state.cart = newCart

              }

              if( chk.quantity > 1 ){

                chk.quantity -= 1


                // cart sessionを更新
                var db = new URLSearchParams()
                db.append( 'session_id'     , state.session_id )
                db.append( 'cart'           , JSON.stringify( state.cart )  )
                db.append( 'userProfile'    , JSON.stringify( this.getters['user/userProfile'] )  )
                axios.post( process.env.MAIN_API + '/setCartSession' , db ).then( function(result){

                    this.dispatch( 'cart/setSession' , result.data)

                }.bind(this))
                .catch((err) => { console.dir(err); })
                .finally(function(){}.bind(this))

              }

          }

          // 同じ商品がない場合は何もしない
          else{

            return

          }

      }

  },

  clearCartData ( state ) {

     state.cart = []
     state.cartCount = 0
     state.session_id = ''

  },

  setSessionData ( state , value ) {

     state.session_id = value

  },

  cartInitData ( state , value ) {

     state.cart = value

     var temp = 0
     state.cart.forEach(v => { 
      temp += Number( v.quantity ) 
     })

     state.cartCount = temp

  },

  setOrderMethodData ( state , value ) {

     state.orderMethod = value

  },
  setStripeTokenData ( state , value ) {

     state.stripeToken = value

  },
  setDeliveryData ( state , value ) {

     state.delivery = value

  },
}


