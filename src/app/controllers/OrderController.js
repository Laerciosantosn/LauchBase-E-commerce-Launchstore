const LoadProductService = require('../services/LoadProductService')
const LoadOrderService = require('../services/LoadOrderService')
const User = require('../models/User')
const Order = require('../models/Order')

const Cart = require('../../lib/cart')
const mailer = require('../../lib/mailer')

const email = (seller, product, buyer) => `
    <h2>Olá ${seller.name}</h2>
    <p>Voce tem um novo pedido de compra do seu produto</p>
    <p>Produto: ${product.name}</p>
    <p>Preço: ${product.formatedPrice}</p>
    <div>${product.img}</div>
    <p><br><br></p>
    <h3>Dados do Comprador</h3>
    <p>${buyer.name}</p>
    <p>${buyer.email}</p>
    <p>${buyer.address}</p>
    <p>${buyer.cep}</p>
    <p><br><br></p>
    <P><strong></strong>Entre em contato com o comprador para finalizar a venda!</strong></P>
    <p><br><br></p>
    <p>Atenciosamente, Equipe Launchstore</p>
`
module.exports = {
    async index(req, res){
        // Pegar os pedidos do usúario
        const orders = await LoadOrderService.load('orders',{
            where: { buyer_id: req.session.userId }
        })
 
        return res.render("orders/index", { orders })
    },
    async sales(req, res){
        // Pegar os pedidos do usúario
        const sales = await LoadOrderService.load('orders',{
            where: { seller_id: req.session.userId }
        })
 
        return res.render("orders/sales", { sales })
    },
    async show(req, res){
        const order = await LoadOrderService.load('order', {
            where: { id: req.params.id}
        })
        return res.render("orders/details", { order })
    },
    async post(req, res) {
        try{

        //  pegar os produtos do carrinho
        const cart = Cart.init(req.session.cart)

        const buyer_id = req.session.userId
        const filteredItems = cart.items.filter(item =>
            item.product.user_id != buyer_id 
        )
        // Criar o pedido
        const createOrdersPromise = filteredItems.map(async item => {
            let { product, price: total, quantity } = item
            const { price, id: product_id, user_id: seller_id } = product
            const status = "open"

            const order = await Order.create({
                seller_id,
                buyer_id,
                product_id,
                price,
                total,
                quantity,
                status
            })

             //   Take the date of product.
        product = await LoadProductService.load('product', { where: {
            id: product_id
        }})
        
        // Os dodos do vendedor
        const seller = await User.findOne({where: {id: seller_id}})
        
        // Os dados do comprador
        const buyer = await User.findOne({where: {id: buyer_id}})
        
        // Enviar email com dados da compra para o vendedor
        await mailer.sendMail({
            to: seller.email,
            from: 'no-reply@launchstore.com.br',
            subject: 'Novo pedido de compra',
            html: email(seller, product, buyer)
        })

        return order

        })

        await Promise.all(createOrdersPromise)
       
        // Clean Cart Deletar carrinho e iniciar o acrrinho vazio após envio do pedido com sucesso
        delete req.session.cart
        Cart.init()

        // notifiar o usuario com alguma mensagem de sucesso
        return res.render('orders/success')
        }
        catch(err){
            console.error(err)
            return res.render('orders/error')
        }
    },
    async update(req, res) {
        try {
            const { id, action } = req.params
         
            const acceptedActions = ['close', 'cancel']

            if(!acceptedActions.includes(action)) return res.send("Can't do this action")

            // pergar o pedido
            const order = await Order.findOne({
                where: { id }
            })
            
            if(!order) return res.send("Order not found")

            // verificar se ele está aberto
            if(order.status != 'open') return res.send("Can't do this action")
            
            //  atualizar o pedido
            const statuses = {
                close: "sold",
                cancel: "canceled"
            }
            order.status = statuses[action]

            await Order.update(id, {
                status: order.status
            })

            // redirecionar
            return res.redirect("/orders/sales")

        }catch (error) {
            console.error(error)
        }
    }
}
