
'use strict'

const Accounts = require('../modules/user.js')

describe('display details()', () => {
	test('can retrieve an existing user', async done => {
		try{
			const account = await new Accounts(':memory:')
			//console.log("Passed constructor")
			await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
			const user = await account.getUser('doej')
			console.log("User: ", user)
			expect(user.email).toBe('email@email.com')
			expect(user.phone).toBe(123456789)
			done()
		}
		catch (err)
		{
			console.log("Display error: ", err)
		}
	})
})

/*describe('user form()', () => {
	test('Form is presented', async done => {
		const account = await new Accounts()
		const form = await account.popupForm()
		const click = document.getElementById('button').addEventListener('click')
		expect(form.click).toBe(true)np
		done()
	})
})*/

describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const register = await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
		expect(register).toBe(true)
		done()
	})

	test('register a duplicate username', async done => {
		try{
			expect.assertions(1)
			const account = await new Accounts()
			await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
			await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
		}
		catch(err) {
			expect(err.message).toBe('username "doej" already in use')
		}
		finally{
			done()
		}
	})

	test('error if blank username', async done => {
		try{
			expect.assertions(1)
			const account = await new Accounts()
			await account.register('', 'password', 'email@email.com', '123456789', 'paypal')
		}
		catch(err) {
			expect(err.message).toBe('missing username')
		}
		finally{
			done()
		}
	})

	test('error if blank password', async done => {
		try{
			expect.assertions(1)
			const account = await new Accounts()
			await expect( await account.register('doej', '', 'email@email.com', '123456789', 'paypal') )
		}
		catch(err) {
			expect(err.message).toBe('missing password')
		}
		finally{
			done()
		}
	})

})

describe('uploadPicture()', () => {
	// this would have to be done by mocking the file system
	// perhaps using mock-fs?
})

describe('login()', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
		const valid = await account.login('doej', 'password')
		expect(valid).toBe(true)
		done()
	})

	test('invalid username', async done => {
		try{
			expect.assertions(1)
			const account = await new Accounts()
			await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
			await expect(await account.login('roej', 'password') )
		}
		catch(err) {
			expect(err.message).toBe('username "roej" not found')
		}
		finally{
			done()

		}
	})

	test('invalid password', async done => {
		try{
			expect.assertions(1)
			const account = await new Accounts()
			await account.register('doej', 'password', 'email@email.com', '123456789', 'paypal')
			await expect( await account.login('doej', 'bad') )
		}
		catch(err) {
			expect(err.message).toBe('doej', 'bad')
		}
		finally{
			done()
		}
	})

})
