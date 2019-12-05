
'use strict'

const User = require('../modules/user.js')
const Display = require('../modules/display.js')

describe('list()', () => {

	test('list items when there are no items', async done => {
		expect.assertions(1)
		const display = await new Display('test1.db')
		const list = await display.list()
		expect(list).toEqual([])
		done()
	})
})

describe('details()', () => {

	test('Get details for a non-existing item', async done => {
		expect.assertions(1)

		const display = await new Display('test2.db')
		const details = await display.details(3)
		expect(details).toEqual()
		done()
	})

	test('Get details for an item', async done => {
		expect.assertions(1)

		const display = await new Display('test2.db')
		const user = await new User('test2.db')
		await user.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
		const itemInfo = {title: 't',shortDesc: 's',
			longDesc: 'l',price: 12, owner: 'o'}
		await user.uploadItem([],itemInfo)
		const details = await display.details(1)
		expect(details).toEqual()
		done()
	})

})
