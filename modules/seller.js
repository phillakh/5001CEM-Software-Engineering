'use strict'

const nodemailer = require('nodemailer')

const transported = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'thegallery2K19@gmail.com',
		pass: 'Coventry19!'
	}
})

const mailOptions = {
	from: 'thegallery2K19@gmail.com',
	to: 'jordantajheria@gmail.com',
	subject: 'Sending Email using Node.js',
	html: '<p>{{username}} and your password is {{password}}</p>'
}

transported.sendMail(mailOptions, (error, info) => {
	if (error) {
		console.log(error)
	} else {
		console.log(`Email has been sent:${ info.response}`)
	}
})
