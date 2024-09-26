import axios from 'axios'

export const state = () => ({
     products      : '',
     shippingTable : '',
     constPref     : '',
     productsByIds: [],
})

export const getters = {

  products: state => {

    return state.products

  },
  shippingTable : state => {

    return state.shippingTable

  },
  constPref: state => {

    return state.constPref

  },

  productByIds: (state) => {
      return state.productsByIds;
  },

}

export const actions = {

  setProducts ({ commit  } ,  value  ) {

    commit('setProductsData',  value )

  },
  setShippingTable ({ commit  } ,  value  ) {

    commit('setShippingTableData',  value )

  },
  setConstPref ({ commit  } ,  value  ) {

    commit('setConstPrefData',  value )

  },
  getProductsByIds(state, value) {
      state.productByIds = axios.get(`${process.env.MAIN_API}/ec/products/${value.appId}?productIds=${value.ids}&perPage=${value.ids.toString().split(',').length}`)
          .then(response => {
              return response.data.products;
          })
          .catch(error => {
              console.log(error);
              return [];
          });
      return state.productByIds;
  }

}

export const mutations = {

  setProductsData ( state , value ) {

     state.products = value

  },
  setShippingTableData ( state , value ) {

     state.shippingTable = value

  },
  setConstPrefData ( state , value ) {

     state.constPref = value

  },

}
