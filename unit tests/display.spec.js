
'use strict'

const sqlite = require('sqlite-async')

const Display = require('../modules/display.js')

describe('list()', () => {

	test('list items', async done => {
        expect.assertions(1)
        let rightResults = []
        let obj = {title:'title3', price: 3, id: 3}
        rightResults.push(obj)
        obj = {title:'title2', price: 2, id: 2}
        rightResults.push(obj)
        obj = {title:'title1', price: 1, id: 1}
        rightResults.push(obj)
        
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
		let sql2 = `VALUES("title1", "short1", `
		let sql3 = `"long1", "1", "owner1")`
        await db.run(sql + sql2 + sql3)
        sql2 = `VALUES("title2", "short2", `
		sql3 = `"long2", "2", "owner2")`
        await db.run(sql + sql2 + sql3)
        sql2 = `VALUES("title3", "short3", `
		sql3 = `"long3", "3", "owner3")`
        await db.run(sql + sql2 + sql3)
		
		const display = await new Display()
		const list = await display.list(db)
		expect(list).toEqual(rightResults)
		done()
	})

	
})

describe('details()', () => {

	test('Get details for a particular item ID', async done => {
        expect.assertions(1)
        let rightResults = {}
        rightResults = {title:'title3', price: 3, id: 3, longDesc: 'long3', owner: 'owner3'}
        
        
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
		let sql2 = `VALUES("title1", "short1", `
		let sql3 = `"long1", "1", "owner1")`
        await db.run(sql + sql2 + sql3)
        sql2 = `VALUES("title2", "short2", `
		sql3 = `"long2", "2", "owner2")`
        await db.run(sql + sql2 + sql3)
        sql2 = `VALUES("title3", "short3", `
		sql3 = `"long3", "3", "owner3")`
        await db.run(sql + sql2 + sql3)
		
		const display = await new Display()
		const details = await display.details(db, 3)
		expect(details).toEqual(rightResults)
		done()
	})

	
})
