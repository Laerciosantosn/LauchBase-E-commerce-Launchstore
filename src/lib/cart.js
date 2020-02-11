const { formatPrice } = require('./utils')
//Carrinho fica guardado na sessão (req.session)
const Cart = {
    init(oldCart) {
        if(oldCart){
            this.items = oldCart.items // [{ product: {}, price, quantity, for}, {}]
            this.total = oldCart.total
        } else {
            this.items = []
            this.total = {
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0)
            }
        }
        return this
    },
    addOne(product){
        //  ver se o produto existe no carrrinho
        let inCart = this.getCartItem(product.id)

        // se não existi productor no carrinho
        if(!inCart){
            inCart = {
                product:  {
                    ...product,
                    formattedPrice: formatPrice(product.price)
                },
                quantity: 0,
                price: 0,
                formattedPrice: formatPrice(0)
            }
            this.items.push(inCart)
        }

        //max quantity exceded
        if(inCart.quantity >= product.quantity) return this

        //update item
        inCart.quantity ++
        inCart.price = inCart.product.price * inCart.quantity
        inCart.formattedPrice = formatPrice(inCart.price)

        //update cart
        this.total.quantity++
        this.total.price += inCart.product.price
        this.total.formattedPrice = formatPrice(this.total.price)

        return this
    },
    removeOne(productId){
        // Pegar item do carrinho
        const inCart =this.getCartItem(productId)

        if(!inCart) return this

        // atualizar o item
        inCart.quantity --
        inCart.price == inCart.product.price * inCart.quantity
        inCart.formattedPrice = formatPrice(inCart.price)

        // atualizar o carrinho
        this.total.quantity --
        this.total.price -= inCart.product.price
        this.total.formattedPrice = formatPrice(this.total.price)

        if(inCart.quantity < 1){
            this.items = this.items.filter(item =>
                item.product.id != inCart.product.id)
               
            return this
        }
        return this
    },
    delete(productId){
        const inCart =this.getCartItem(productId)
        if(!inCart) return this

        if(this.items.length > 0) {
            this.total.quantity -= inCart.quantity
            this.total.price -= (inCart.product.price * inCart.quantity)
            this.total.formattedPrice = formatPrice(this.total.price)
            // console.log('if(this.items.length > 0) in DELETE')
        }

        this.items = this.items.filter(item => inCart.product.id != item.product.id)
        return this
    },
    getCartItem(productId){
        return this.items.find(item => item.product.id == productId)
    }
}
const product = {
    id: 1,
    price: 199,
    quantity: 2
}
const product2 = {
    id: 2,
    price: 229,
    quantity: 1
}
module.exports = Cart