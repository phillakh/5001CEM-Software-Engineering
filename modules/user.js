
'use strict'

const bcrypt = require('bcrypt-promise')
const fs = require('fs-extra')
const mime = require('mime-types')
const sqlite = require('sqlite-async')
const saltRounds = 10

module.exports = class User {

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sqlUsersTable = '(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT, email TEXT, phone INTEGER);'
			const sql = `CREATE TABLE IF NOT EXISTS users ${ sqlUsersTable}`
			await this.db.run(sql)
			// we need this table to store the user items
			const sqlItemsTable1 = '(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, '
			const sqlItemsTable2 = 'shortDesc TEXT, longDesc TEXT, price INTEGER, owner TEXT);'
			const sqlItemsTable = 'CREATE TABLE IF NOT EXISTS items '
			const sqlItems = `${sqlItemsTable} ${ sqlItemsTable1}${ sqlItemsTable2}`
			await this.db.run(sqlItems)
			return this
		})()
	}

	async register(user, pass, email, phone) {
		try {
			if(user.length === 0) throw new Error('missing username')
			if(pass.length === 0) throw new Error('missing password')
			let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`username "${user}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			const isnum = /^\d+$/.test(phone);
			if(!isnum) throw new Error(`${phone} is not a valid phone number`)
			sql = `INSERT INTO users(user, pass, email, phone) VALUES("${user}", "${pass}", "${email}", 
			"${phone}")`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}

	async uploadPicture(path, mimeType) {
		const extension = mime.extension(mimeType)
		console.log(`path: ${path}`)
		console.log(`extension: ${extension}`)
		await fs.copy(path, `public/avatars/${this.username}.jpeg`)
	}

	async login(username, password) {
		try {
			let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
			const records = await this.db.get(sql)
			if(!records.count) throw new Error(`username "${username}" not found`)
			sql = `SELECT pass FROM users WHERE user = "${username}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(password, record.pass)
			if(valid === false) throw new Error(`invalid password for account "${username}"`)
			return true
		} catch(err) {
			throw err
		}
	}

	async uploadItem(path, itemInfo) {
		try{

			if(itemInfo.title.length === 0) throw new Error('missing title')
			if(itemInfo.price.length === 0) throw new Error('missing price')
			let sqlID = `SELECT count(id) AS count FROM items;`
			const records = await this.db.get(sqlID)
			await fs.copy(path, `public/itemImages/${records.count+1}.jpeg`)
			const sql = 'INSERT INTO items(title, shortDesc, longDesc, price, owner) '
			const sql2 = `VALUES("${itemInfo.title}", "${itemInfo.shortDesc}", `
			const sql3 = `"${itemInfo.longDesc}", "${itemInfo.price}", "${itemInfo.owner}")`
			await this.db.run(sql + sql2 + sql3)
		} catch(err) {
			throw err
		}
	}

}
