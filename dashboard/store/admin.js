export const state = () => ({

     adminUser  : null,
     adminList  : '',

     addUser    : '',

 })


export const getters = {

	adminUser : state => {

		return state.adminUser

	},
	adminList : state => {

		return state.adminList

	},
	addUser : state => {

		return state.addUser

	},


}

export const actions = {

	setAdminUser ( { commit } , value ) {

		commit('setAdminUserData',  value )

	},
	setAdminList ( { commit } , value ) {

		commit('setAdminListData',  value )

	},
	setAddUser ( { commit } , value ) {

		commit('setAddUserData',  value )

	},


}


export const mutations = {

	setAdminUserData ( state ,  value ) {

		state.adminUser = value

	},
	setAdminListData ( state ,  value ) {

		state.adminList = value

	},
	setAddUserData ( state ,  value ) {

		state.addUser = value

	},

	
}
