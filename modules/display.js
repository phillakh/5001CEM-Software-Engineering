
'use strict'

const sqlite = require('sqlite-async')

module.exports = class Display {

	async list(dbName) {
		try {
			const sql = 'SELECT id, title, price FROM items ORDER BY id DESC LIMIT 9;'
			if (typeof dbName === 'object') {
				const data = await dbName.all(sql)
				await dbName.close()
				return data
			} else {
				const db = await sqlite.open(dbName)
				const data = await db.all(sql)
				await db.close()
				return data
			}
		} catch(err) {
			throw err
		}
	}

	async details(dbName, id) {
		try {
			const sql = `SELECT id, title, price, owner, longDesc FROM items WHERE id = "${id}";`
			if (typeof dbName === 'object') {
				const data = await dbName.get(sql)
				await dbName.close()
				return data
			} else {
				const db = await sqlite.open(dbName)
				const data = await db.get(sql)
				await db.close()
				return data
			}
		} catch(err) {
			throw err
		}
	}

	async search(dbName, query) {
		try {
			const sql = 'SELECT id, title, price FROM items WHERE title '
			const sqlCondition = `LIKE "%${query}%" OR longDesc LIKE "%${query}%" OR shortDesc LIKE "%${query}%";`
			if (typeof dbName === 'object') {
				const data = await dbName.all(sql + sqlCondition)
				await dbName.close()
				return data
			} else {
				const db = await sqlite.open(dbName)
				const data = await db.all(sql + sqlCondition)
				await db.close()
				return data
			}
		} catch(err) {
			throw err
		}
	}
	async userDetails(dbName, id) {
		try {
			const sql = `SELECT id, user, email, phone FROM users WHERE id = "${id}";`
			if (typeof dbName === 'object') {
				const data = await dbName.get(sql)
				await dbName.close()
				return data
			} else {
				const db = await sqlite.open(dbName)
				const data = await db.get(sql)
				await db.close()
				return data
			}
		} catch(err) {
			throw err
		}
	}
	async userInterests(dbName, id) 
	{
		try {
			const db = await sqlite.open(dbName)
			const sqlUser = `SELECT user FROM users WHERE id = "${id}";`
			const user = await db.get(sqlUser)
			console.log('user: ', user)
			const sql = `SELECT itemid, interest FROM interest WHERE user = "${user.user}";`
			const interests = await db.all(sql)
			console.log('interests: ', interests)
			await db.close()
			return interests
		} catch(err) {
			throw err
		}
	}

	async userToUserId(dbName, user) {
		try {
			const db = await sqlite.open(dbName)
			const sqlUser = `SELECT id FROM users WHERE user = "${user}";`
			const userInfo = await db.get(sqlUser)
			await db.close()
			return userInfo
		} catch(err) {
			throw err
		}
	}
}

