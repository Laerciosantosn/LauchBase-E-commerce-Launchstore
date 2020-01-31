const { unlinkSync } = require('fs')
const { hash } = require('bcryptjs')

const User = require('../models/User')
const Products = require('../models/Products')
const LoadProductsService = require('../services/LoadProductService')



const { formatCep, formatCpfCnpj } = require('../../lib/utils')

module.exports = {
    registerFrom (req, res) {
        return res.render("user/register")
    },
    async show(req, res) {
        try {
            const { user } = req

            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
            user.cep = formatCep(user.cep)

            return res.render('user/index', { user } )

        }catch (error) {
            console.error(error);
        }
    },
    async post (req, res) {
        try {
            let { name, email, password, cpf_cnpj, cep, address} = req.body

            password = await hash(password, 8)
            cpf_cnpj = cpf_cnpj.replace(/\D/g,"")
            cep = cep.replace(/\D/g,"")

            const userId = await User.create({
                name,
                email, 
                password,
                cpf_cnpj, 
                cep,
                address
            })

            req.session.userId = userId

            return res.redirect('/users')

        }catch (error) {
            console.error(error);
        }
    },
    async update(req, res){
      try {
        const { user } = req
        let { name, email, cpf_cnpj, cep, address } = req.body

        cpf_cnpj = cpf_cnpj.replace(/\D/g,"")
        cep = cep.replace(/\D/g,"")

        await User.update(user.id, {
            name,
            email,
            cpf_cnpj,
            cep,
            address
        })

        return res.render("user/index", {
            user: req.body,
            success: "Acount updated with success"
        })

      }catch(err) {
          console.error(err)
          return res.render("user/index", {
              error: "Some error happened"
          })
      }

    },
    async delete(req, res) {

        try {
            //  Take all the products
            const products =  await Products.findAll({where: { user_id: req.body.id }})
              
            //  In the products take all imges
            const allFilesPromise = products.map(product =>
                Products.files(product.id))

            let promiseResults = await Promise.all(allFilesPromise)
    
            // perform delete of user
            await User.delete(req.body.id)
            req.session.destroy()

            //  remove images in public folder
            promiseResults.map(files => {
               files.map(file => {
                    try {
                        unlinkSync(file.path)
                    } catch(err) {
                        console.error(err)
                    }
                }) 
            })

            return res.render("session/login",{
                success: "Account Deleted with success!"
            })
  
        }catch(err) {
            console.error(err)
            return res.render("user/index", {
                user:req.body,
                error: "Error! Your can not delete you account"
            })
        }
    },
    async ads(req, res) {
        const products =  await LoadProductsService.load('products', {
            where: { user_id: req.session.userId }
        })

        return res.render("user/ads", { products })
    }
}