import axios from 'axios'

export const state = () => ({
    productsByIds: []
})

export const getters = {
    productByIds: (state) => {
        return state.productsByIds;
    },
}

export const mutations = {

}

export const actions = {
    getProductsByIds(state, value) {
        state.productByIds = axios.get(`${process.env.MAIN_API}/b2b/products/*?productIds=${value}&getAll=true`)
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