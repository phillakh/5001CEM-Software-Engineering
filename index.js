#!/usr/bin/env node

//Routes File

'use strict'

/* MODULE IMPORTS */
const Koa = require('koa')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})
const session = require('koa-session')
const router = require('./routes')
const currentUser = null
/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')
const seller = require('./modules/seller.js')
const app = new Koa()
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
		await ctx.redirect('/homepage')
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
		const body = ctx.request.body
		const user = await new User(dbName)
		await user.register(body.user, body.pass, body.email, body.phone, body.paypal)
		const avatar = ctx.request.files.avatar
		await user.uploadPicture(avatar.path, `image/${avatar.type}`, body.user)
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
/**
 * The item upload page.
 *
 * @name Upload Page
 * @route {GET} /upload
 */
router.get('/upload', async ctx => await ctx.render('upload'))
/**
 * The script to process new item uploads.
 *
 * @name Upload Script
 * @route {POST} /upload
 */
router.post('/upload', koaBody, async ctx => {
	try {
		const body = ctx.request.body
		body.owner = ctx.session.username
		const user = await new User(dbName)
		const id = await user.uploadItem(ctx.request.files['itemImages[]'], body)
		await ctx.redirect(`/details/${id}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.get('/confirmation', async ctx => {
	try {
		const accounts = await new User('website.db')
		const body = ctx.request.body
		ctx.session.username = body.user
		const data = await accounts.getUser(currentUser)
		await ctx.render('confirmation',{user: data})
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})

router.post('/confirmation', async ctx => {
	try {
		seller.sendEmail()
		await ctx.render('confirmation')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})
app.use(router.routes())
app.use(router.allowedMethods())
module.exports = app.listen(port, async() => console.log(`listening on port ${port}`))
