/* eslint-disable max-lines-per-function */

//#!/usr/bin/env node

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
const nodemailer = require('nodemailer')

/* IMPORT CUSTOM MODULES */
const Display = require('./modules/display.js')
const app = new Koa()
const User = require('./modules/user')
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
		const display = await new Display('website.db')
		const data = await display.list()
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
		const display = await new Display('website.db')
		const data = await display.details(ctx.params.id)
		data.userid = await display.userToUserId(data.owner)
		ctx.session.item = ctx.params.id
		await ctx.render('details', data )

	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.post('/details', koaBody, async ctx => {
	try {
		const user = await new User('website.db')
		await user.setInterest(ctx.session.username, ctx.session.item, ctx.request.body.interest)

		await ctx.redirect('/homepage')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.post('/emailConfirmation', async ctx => {
	try {
		const body = ctx.request.body
		const smtpConfig = {
			host: 'smtp.gmail.com',
			port: 465,
			secure: true, // use SSL
			auth: {
				user: 'lewtestmailcs@gmail.com',
				pass: 'ilolpop123'
			}
		}
		const transporter = nodemailer.createTransport(smtpConfig)
		// setup e-mail data with unicode symbols
		const mailOptions = {
			from: 'Lewis Test Mail <lewistestmailcs@gmail.com>', // sender address
			to: 'lewtestmailcs@gmail.com', // list of receivers
			subject: 'Contact seller', // Subject line
			text: `Email from a customer. email:${body.email}, message: ${body.message}`, // plaintext body
			html: `<p>Email from a customer</p><p>Email: ${body.email}</p><p>Email: ${body.message}</p>` // html body
		}
		await transporter.sendMail(mailOptions)
		await ctx.render('emailConfirmation', {detailsmsg: {msg:'Email has been sent!'}})
	} catch(err) {
		await ctx.render('error', {detailsmsg: err})
	}
})

/**
 * The user page with all their items.
 *
 * @name user-homepage Page
 * @route {GET} /user-homepage/:uid
 */
router.get('/user-homepage', async ctx => {
	try{
		if (ctx.session.authorised !== true) {
			ctx.redirect('/homepage')
		} else {
			const display = await new Display('website.db')
			const data = await display.userDetails(ctx.session.username)
			const userid = await display.userToUserId(ctx.session.username)
			const interests= await display.userInterests(userid)
			await ctx.render('user', {user: data, interest: interests} )
		}
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
		const display = await new Display('website.db')
		const data = await display.list()
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
		const display = await new Display('website.db')
		const results = await display.search(query)
		await ctx.render('search', {item: results})
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})
module.exports = router
