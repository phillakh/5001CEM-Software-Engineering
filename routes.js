#!/usr/bin/env node

//Routes File

'use strict'

/* MODULE IMPORTS */
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})
const session = require('koa-session')

/* IMPORT CUSTOM MODULES */
const Display = require('./modules/display.js')
const app = new Koa()

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

'use strict'

const router = new Router()

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
		await ctx.render('details', data )

	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.post('/details', koaBody, async ctx => {
	try {
		
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
		const display= await new Display()
		const userInfo= await display.userDetails('website.db', ctx.params.uid)
		await ctx.render('user', {user: userInfo} )
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

/**
 * Fake Paypal page.
 *
 * @name paypal Page
 * @route {GET} /paypal
 */

router.get('/paypal', async ctx => {
	try {
		const display = await new Display()
		const data = await display.list('website.db')
		await ctx.render('paypal', {item: data} )
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
 * The search page to search globally for items.
 *
 * @name search Page
 * @route {GET} /search
 */

router.get('/search', async ctx => {
	const results = {}
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
		const results = await display.search('website.db', query)
		await ctx.render('search', {item: results})
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

module.exports = router
