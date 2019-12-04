
'use strict'

const sqlite = require('sqlite-async')

module.exports = class Display {

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			const sqlUsersTable = 'user TEXT, pass TEXT, email TEXT, phone INTEGER, paypal TEXT);'
			const sql = `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, ${ sqlUsersTable}`
			await this.db.run(sql)
			const sqlItemsTable1 = '(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, '
			const sqlItemsTable2 = 'shortDesc TEXT, longDesc TEXT, price INTEGER, owner TEXT);'
			const sqlItemsTable = 'CREATE TABLE IF NOT EXISTS items '
			const sqlItems = `${sqlItemsTable} ${ sqlItemsTable1}${ sqlItemsTable2}`
			await this.db.run(sqlItems)
			const sqlInterest2 = '(user TEXT, itemid INTEGER, interest INTEGER, PRIMARY KEY(user, itemid));'
			const sqlInterest1 = 'CREATE TABLE IF NOT EXISTS interest '
			const sqlInterest = `${ sqlInterest1}${ sqlInterest2}`
			await this.db.run(sqlInterest)
			return this
		})()
	}


	
	async list() {
		try {
			const sql = 'SELECT id, title, price FROM items ORDER BY id DESC LIMIT 9;'
			const data = await this.db.all(sql)
			for (const element of data) {
				 element.interest =  await this.itemInteresteds(element.id)
			};

			return data
		} catch(err) {
			throw err
		}
	}

	async details(id) {
		try {
			const sql = `SELECT id, title, price, owner, longDesc, shortDesc FROM items WHERE id = "${id}";`
			const data = await this.db.get(sql)
			return data
		} catch(err) {
			throw err
		}
	}

	async search(query) {
		try {
			const sql = 'SELECT id, title, price FROM items WHERE title '
			const sqlCondition = `LIKE "%${query}%" OR longDesc LIKE "%${query}%" OR shortDesc LIKE "%${query}%";`
			const data = await this.db.all(sql + sqlCondition)
			return data
		} catch(err) {
			throw err
		}
	}
	async userDetails(user) {
		try {
			const sql = `SELECT id, user, email, phone FROM users WHERE user = "${user}";`
			const data = await this.db.get(sql)
			return data
		} catch(err) {
			throw err
		}
	}
	async userInterests(id) {
		try {

			const sqlUser = `SELECT user FROM users WHERE id = "${id.id}";`
			const user = await this.db.get(sqlUser)
			const sql = `SELECT itemid, interest FROM interest WHERE user = "${user.user}";`
			const interests = await this.db.all(sql)
			return interests
		} catch(err) {
			throw err
		}
	}

	async userToUserId(user) {
		try {
			const sqlUser = `SELECT id FROM users WHERE user = "${user}";`
			const userInfo = await this.db.get(sqlUser)
			return userInfo
		} catch(err) {
			throw err
		}
	}

	async listOwned(user) {
		try {
			const sql = `SELECT id, title, price FROM items WHERE owner = "${user}";`
			const data = await this.db.all(sql)
			return data
		} catch(err) {
			throw err
		}
	}

	async itemInteresteds(id) {
		try {
			const sql = `SELECT interest, user FROM interest WHERE itemid = "${id}";`
			const interests = await this.db.all(sql)
			return interests
		} catch(err) {
			throw err
		}
	}
}

