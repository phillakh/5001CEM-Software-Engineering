
'use strict'

const sqlite = require('sqlite-async')

const User = require('../modules/user.js')
const Display = require('../modules/display.js')

describe('list()', () => {

	test('list when there are no items', async done => {
		expect.assertions(1)
		const display = await new Display(':memory:')
		const list = await display.list()
		expect(list).toEqual([])
		done()
	})

	// test('list items when there is 1 item in the database', async done => {
	// 	expect.assertions(1)
	// 	const display = await new Display('file:memdb2?mode=memory&cache=shared')
	// 	const user = await new User('file:memdb2?mode=memory&cache=shared')
	// 	await user.register('u','p','email@email.com','123','pp')
	// 	const item = {title: 'title', shortDesc: 's', longDesc: 'l', price: 13, owner: 'u'}
	// 	await user.uploadItem([], item)
	// 	const result = [{id: 1, price: 13, title: "title"}]
	// 	const list = await display.list()
	// 	expect(list).toEqual(result)
	// 	done()
	// })
})

describe('details()', () => {

	test('Get details for a particular item ID', async done => {
		expect.assertions(1)
		let rightResults = {}
		rightResults = {title: 'title3', price: 3, id: 3, longDesc: 'long3', owner: 'owner3'}


		//Arranges the in-memory database with the needed table
		const db = await sqlite.open(':memory:')
		console.log(typeof db)
		const sqlItemsTable1 = '(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, '
		const sqlItemsTable2 = 'shortDesc TEXT, longDesc TEXT, price INTEGER, owner TEXT);'
		const sqlItemsTable = 'CREATE TABLE IF NOT EXISTS items '
		const sqlItems = `${sqlItemsTable} ${ sqlItemsTable1}${ sqlItemsTable2}`
		await db.run(sqlItems)
		//Arranges the in-memory database by populating it with data
		const sql = 'INSERT INTO items(title, shortDesc, longDesc, price, owner) '
		let sql2 = 'VALUES("title1", "short1", '
		let sql3 = '"long1", "1", "owner1")'
		await db.run(sql + sql2 + sql3)
		sql2 = 'VALUES("title2", "short2", '
		sql3 = '"long2", "2", "owner2")'
		await db.run(sql + sql2 + sql3)
		sql2 = 'VALUES("title3", "short3", '
		sql3 = '"long3", "3", "owner3")'
		await db.run(sql + sql2 + sql3)

		const display = await new Display()
		const details = await display.details(db, 3)
		expect(details).toEqual(rightResults)
		done()
	})


})
