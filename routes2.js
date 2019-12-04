/* eslint-disable max-lines-per-function */

//#!/usr/bin/env node

//Routes File

'use strict'

/* MODULE IMPORTS */
const Koa = require('koa')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const nodemailer = require('nodemailer')

/* IMPORT CUSTOM MODULES */
const app = new Koa()
const router = require('./routes')
/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

router.post('/emailConfirmation', async ctx => {
	try {
		console.log('test')
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
			subject: 'Someone is interested in your item', // Subject line
			text: `Email from a customer. email:${body.email}, message: ${body.message}`, // plaintext body
			html: `<p>Email from a customer</p><p>Email: ${body.email}</p><p>Email: ${body.message}</p>` // html body
		}
		console.log('test1')
		await transporter.sendMail(mailOptions)
		console.log('test2')
		await ctx.render('emailConfirmation', {detailsmsg: {msg: 'Email has been sent!'}})
		console.log('test3')
	} catch(err) {
		await ctx.render('error', {detailsmsg: err})
	}
})

module.exports = router
