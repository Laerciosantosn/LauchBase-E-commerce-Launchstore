const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const ProductsController = require("../app/controllers/ProductsControllers")
const SearchController = require("../app/controllers/SearchController")

const { onlyUsers } = require("../app/middlewares/session")

const Validator = require('../app/validators/product')

routes.get('/search', SearchController.index)

routes.get('/create', onlyUsers, ProductsController.create)
routes.get('/:id', ProductsController.show)
routes.get('/:id/edit', onlyUsers, ProductsController.edit)

routes.post('/',  onlyUsers, multer.array("photos", 6), Validator.post, ProductsController.post)
routes.put('/', onlyUsers, multer.array("photos", 6), Validator.put, ProductsController.put)
routes.delete('/', onlyUsers, ProductsController.delete)


module.exports = routes