const User = require('../models/User')
const { compare } = require('bcryptjs')

async function login(req, res, next) {
    const { email, password } = req.body

    const user = await User.findOne({ where: {email} })
    
    if (!user)  return res.render("session/login", {
        user: req.body,
        error: "User not registered"
    })

    const passed = await compare(password, user.password)

    if(!passed) {
        return res.render("session/login", {
            user:req.body,
            error: "Password mismatch"
        })
    } 

    req.user = user
    next()

}

async function forgot(req, res, next) {
    const { email } = req.body

    try {
        let user = await User.findOne ({ where: { email } })

        if (!user)  return res.render("session/forgot-password", {
            user: req.body,
            error: "Email not registered"
        })

        req.user = user

        next()

    }catch (err) {
        console.error(err)
    } 
}

async function reset(req, res, next) {
    //  Find the user
    const { email, password, token, passwordRepeat } = req.body

    const user = await User.findOne({ where: {email} })

    if (!user)  return res.render("session/password-reset", {
        user: req.body,
        token,
        error: "User not registered"
    })

    //  See if the password is equal
    if (password != passwordRepeat)
     return res.render("session/password-reset", {
        user: req.body,
        token,
        error: 'The passwords is not equal' 
    })

    //  Verify if the token is true
    if (token != user.reset_token) {
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'Token is invalid! request a new password recovery' 
        })
    }

    //  Verify if the tokne not expired
    let now = new Date()
    now = now.setHours(now.getHours())
    if(now > user.reset_token_expires){
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'Token is expired! request a new password recovery' 
        })
    }

    req.user = user

    next()

}

module.exports = {
   login,
   forgot,
   reset
}