#!/usr/bin/env node

const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const views = require('koa-views')
app.use(require('koa-static')('public'))
const port = 8080

app.use(views(`${__dirname}/views`, { extension: 'html' }, {map: { handlebars: 'handlebars' }}))

router.get('/', async ctx => await ctx.render('art'))
router.get('/art', async ctx => ctx.render('art'))


app.use(router.routes())
module.exports = app.listen(port, () => console.log(`listening on port ${port}`))
