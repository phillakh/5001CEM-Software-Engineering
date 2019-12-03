'use strict'

const Accounts = require('../modules/user.js')
const Transaction = require('../modules/seller')

describe('sends user details to buyer()', () => {
	test('Can retrieve users data', async done => {
		try{
			const account = await new Accounts(':memory:')
			await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
			const user = await account.getUser('doej')
			console.log('User: ', user)
			expect(user.email).toBe('email@email.com')
			expect(console.log).toBe('Email has been sent')
			done()
		} catch (err) {
			console.log('Display error: ', err)
		} finally{
			done()
		}
	})

	test('Transporter is created', async done => {
		try{
			const transaction = await new Transaction()
			const created = await transaction.createTransport('thegallery2K19@gmail.com', 'Coventry19!')
			expect(created.user).toBe('thegallery2K19@gmail.com')
			expect(created.pass).toBe('Coventry19!')
		} catch (err) {
			console.log('error')
		} finally {
			done()
		}
	})
})
