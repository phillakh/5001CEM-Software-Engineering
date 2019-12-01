
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
	async register(user, pass, email, phone, paypal) {
		try {
			if(user.length === 0) throw new Error('missing username')
			if(pass.length === 0) throw new Error('missing password')
			let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`username "${user}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			sql = `INSERT INTO users(user, pass, email, phone, paypal) VALUES("${user}", "${pass}", "${email}", 
			"${phone}", "${paypal}");`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}

	async uploadPicture(path, mimeType, username) {
		const extension = mime.extension(mimeType)
		console.log(`path: ${path}`)
		console.log(`extension: ${extension}`)
		await fs.copy(path, `public/avatars/${username}.jpeg`)
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

	async directoryMaker(directory) {
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory)
		}
	}

	async uploadItemPictures(imageArray, id) {
		if(imageArray.length) {
			for (let i = 0; i < imageArray.length; i++) {
				await fs.copy(imageArray[i].path, `public/itemImages/${id}/${i}.jpeg`)
			}
		}else{
			fs.copy(imageArray.path, `public/itemImages/${id}/0.jpeg`)
		}

	}

	async uploadItem(imageArray, itemInfo) {
		try{

			if(itemInfo.title.length === 0) throw new Error('missing title')
			if(itemInfo.price.length === 0) throw new Error('missing price')
			const sqlID = 'SELECT count(id) AS count FROM items;'
			const records = await this.db.get(sqlID)
			const id = records.count+1
			await this.directoryMaker(`public/itemImages/${id}`)
			await this.uploadItemPictures(imageArray, id)
			const sql = 'INSERT INTO items(title, shortDesc, longDesc, price, owner) '
			const sql2 = `VALUES("${itemInfo.title}", "${itemInfo.shortDesc}", `
			const sql3 = `"${itemInfo.longDesc}", "${itemInfo.price}", "${itemInfo.owner}");`
			await this.db.run(sql + sql2 + sql3)
			return id
		} catch(err) {
			throw err
		}
	}
	async getUser(user) {
		try {
			const sql = `SELECT user, email, phone FROM users WHERE user ="${user}";`
			if (typeof dbName === 'object') {
				const data = await this.db.get(sql)
				return data
			}else{
				const data = await this.db.get(sql)
				return data
			}
		} catch(err) {
			throw err
		}
	}
	async setInterest(user, itemid, interest) {
		try {
			let sql = `SELECT COUNT(user) as records FROM interest WHERE user="${user}" AND itemid="${itemid}";`
			const data = await this.db.get(sql)
			sql = `INSERT INTO interest(user, itemid, interest) VALUES("${user}", "${itemid}", "${interest}");`
			if(data.records !== 0) {
				sql = `UPDATE interest SET interest = '${interest}' WHERE user="${user}"
			 AND itemid="${itemid}";`
			}
			await this.db.run(sql)
		} catch(err) {
			throw err
		}
	}

}
