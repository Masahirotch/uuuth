import axios from 'axios'

export const state = () => ({

     cart     : [],
     quantity : 0,

})

export const getters = {

  cart: state => {

    return state.cart

  },

  quantity: state => {

    return state.quantity

  },

}

export const actions = {

  setCart ( { rootState , commit  } ,  value  ) {

    var obj = {

      userId : rootState.user.userProfile.userId,
      value  : value

    }

    commit( 'setCartData' , obj )

  },

  clearCart ( { rootState , commit  } ) {

    var userId = rootState.user.userProfile.userId

    commit( 'clearCartData' ,  userId )

  },

}

export const mutations = {

  setCartData ( state , obj ) {



      /// カート内アイテムの数量を計算する //////////////////////////
      var allQuantity = 0

      var items = JSON.parse( JSON.stringify( obj.value ) )

      items.forEach( i =>{

          allQuantity += i.quantity

      })

      state.quantity = allQuantity
      ////////////////////////////////////////////////////////

      state.cart = obj.value

      if( state.cart.length > 0 ){

          var db = new URLSearchParams()
          db.append( 'cart'   , JSON.stringify( state.cart ) )
          db.append( 'userId' , obj.userId )
          axios.post( process.env.API + 'updateCart' , db ).then( function( result ){


          }.bind(state)).catch((err) => { console.dir(err); })

      }
      else{

          var db = new URLSearchParams()
          db.append( 'userId' , obj.userId )
          axios.post( process.env.API + 'clearCart' , db ).then( function( result ){

          }.bind(state)).catch((err) => { console.dir(err); })

      }


  },

  clearCartData ( state , userId ) {

      var db = new URLSearchParams()
      db.append( 'userId' , userId )
      axios.post( process.env.API + 'clearCart' , db ).then( function( result ){

      }.bind(state)).catch((err) => { console.dir(err); })

      state.cart     = []
      state.quantity = 0

  },



}



