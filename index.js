#!/usr/bin/env node

//Routes File

'use strict'

/* MODULE IMPORTS */
const querystring = require('querystring');
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})
const session = require('koa-session')
//const jimp = require('jimp')

/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')
const Display = require('./modules/display')


const app = new Koa()
const router = new Router()

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

const defaultPort = 8080
const port = process.env.PORT || defaultPort
const dbName = 'website.db'

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */
router.get('/', async ctx => {
	try {
		if(ctx.session.authorised !== true) return ctx.redirect('/login?msg=you need to log in')
		const data = {}
		if(ctx.query.msg) data.msg = ctx.query.msg
		await ctx.render('index')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		console.log(body)
		// call the functions in the module
		const user = await new User(dbName)
		await user.register(body.user, body.pass, body.email, body.phone, body.paypal)
		const avatar = ctx.request.files.avatar
		await user.uploadPicture(avatar.path, `image/${avatar.type}`, body.user)
		// redirect to the home page
		ctx.redirect(`/?msg=new user "${body.name}" added`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The user login page.
 *
 * @name Login Page
 * @route {GET} /login
 */

router.get('/login', async ctx => {
	const data = {}
	if(ctx.query.msg) data.msg = ctx.query.msg
	if(ctx.query.user) data.user = ctx.query.user
	await ctx.render('login', data)
})

/**
 * The script to process user logins.
 *
 * @name Login Script
 * @route {POST} /login
 */

router.post('/login', async ctx => {
	try {
		const body = ctx.request.body
		const user = await new User(dbName)
		await user.login(body.user, body.pass)
		ctx.session.authorised = true
		ctx.session.username = body.user

		return ctx.redirect('/homepage')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = null
	delete ctx.session.username
	ctx.redirect('/?msg=you are now logged out')
})

/**
 * The item upload page.
 *
 * @name Upload Page
 * @route {GET} /upload
 */

router.get('/upload', async ctx => ctx.render('upload'))

/**
 * The script to process new item uploads.
 *
 * @name Upload Script
 * @route {POST} /upload
 */

router.post('/upload', koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		body.owner = ctx.session.username
		// call the functions in the module
		const user = await new User(dbName)
		
		const id = await user.uploadItem(ctx.request.files[`itemImages[]`], body)

		// redirect to the home page
		ctx.redirect(`/details/${id}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The homepage with gallery items grid.
 *
 * @name homepage Page
 * @route {GET} /homepage
 */

router.get('/homepage', async ctx => {
	try {
		const display = await new Display()
		const data = await display.list('website.db')
		await ctx.render('homepage', {item: data} )
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The details page.
 *
 * @name details Page
 * @route {GET} /details
 */

router.get('/details/:id', async ctx => {
	try {
		const display = await new Display()
		const data = await display.details('website.db', ctx.params.id)
		console.log(ctx.params.id)
		console.log(data)
		await ctx.render('details', data )

	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The user page with all their items.
 *
 * @name user-homepage Page
 * @route {GET} /user-homepage/:uid
 */

router.get('/user-homepage/:uid', async ctx => {
	try {
		// let uID = ctx.params.uid
		// Query the db to get a user given an uID
		let userInfo
		await ctx.render('user', {user: userInfo} )
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * The search page to search globally for items.
 *
 * @name search Page
 * @route {GET} /search
 */

router.get('/search', async ctx => {
	let results = {}
	await ctx.render('search', {item: results})

})

/**
 * The search page to search globally for items.
 *
 * @name search Page
 * @route {POST} /search
 */

router.post('/search', koaBody, async ctx => {
	try {
		const query = ctx.request.body.query
		const display = await new Display()
		let results = await display.search('website.db', query)
		await ctx.render(`search`, {item: results})
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})



app.use(router.routes())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))
