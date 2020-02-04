const Cart = require('../../lib/cart')

const LoadProductsService = require('../services/LoadProductService')

module.exports = {
    async index(req, res){
        try{
            const product = await LoadProductsService.load('product', {where: { id: 3 }})
            
            let { cart } = req.session

           //genciador de carrinho
           cart = Cart.init(cart).addOne(product)

           return res.render("cart/index", { cart })
        }
        catch(err){
            console.error(err)
        }
    }
}
