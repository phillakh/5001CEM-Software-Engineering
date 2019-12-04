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
const Display = require('./modules/display.js')
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
		const display = await new Display('website.db')
		console.log('yo')
		const body = ctx.request.body
		const emailInfo = await display.emailDetails(ctx.session.item, ctx.session.username)
		console.log('passou o method')
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
		console.log(emailInfo)
		const mailOptions = {
			from: 'Lewis Test Mail <lewistestmailcs@gmail.com>',
			to: emailInfo.email.email,

			subject: 'Someone is interested in your item',

			text: `${ctx.session.username} is interested in your item "${emailInfo.title}",
            priced at ${emailInfo.price}. 
            ${ctx.session.username} contact information: 
            Email: ${emailInfo.sender.email}, Phone: ${emailInfo.sender.phone}
             message: ${body.message}`,

			html: `<p>${ctx.session.username} is interested in your item "${emailInfo.title}", 
            priced at ${emailInfo.price}.</p>
            <p>${ctx.session.username} contact information:</p> <p>Email: ${emailInfo.sender.email}</p>
            <p>Phone: ${emailInfo.sender.phone}</p>
            <p> message: ${body.message}</p>`
		}
		await transporter.sendMail(mailOptions)
		await ctx.render('emailConfirmation', {detailsmsg: {msg: 'Email has been sent!'}})
	} catch(err) {
		await ctx.render('error', {detailsmsg: err})
	}
})

module.exports = router
