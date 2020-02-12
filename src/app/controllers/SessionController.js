const User = require('../models/User')

const { hash } = require('bcryptjs')

const crypto = require('crypto')
const mailer = require('../../lib/mailer')

module.exports = {
    loginForm(req,res) {
        return res. render("session/login")
    },
    login(req, res){
        req.session.userId =  req.user.id
        req.session.userName =  req.user.name
        req.session.userEmail =  req.user.email
        return res.redirect("/users")
    },
    logout(req, res) {
        req.session.destroy()
        return res.redirect("/")
    }, 
    forgotForm(req,res) {
        return res. render("session/forgot-password")
    },
    async forgot(req,res) {
        const user = req.user

        try {
                //  One token for this user
            const token = crypto.randomBytes(20).toString("hex")

            //  Create an expiration
                let now = new Date()
                now = now.setHours(now.getHours() + 1 )
        
                await User.update(user.id, {
                    reset_token: token,
                    reset_token_expires: now
                })
        
            //  Send a email with the link of recovery the password
            await mailer.sendMail({
                to: user.email,
                from: 'no-replay#launchstore.com.br',
                subject: 'Recovey the password',
                html: `<h2> Lost the key ?</h2>
                <P> Dont, worry, click the link below to recovery your password</P>
                <p>
                    <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blanck">
                        RECOVERY THE PASSWORD
                    </a>
                </p>
    
                `,
            }) 
    
            //  Warns the user that we sent the email
            return res.render("session/forgot-password",{
                success: "Verify you email for reset your password!"
            })

            }catch(err) {
            console.error(err)
            return res.render("session/forgot-password", {
                error: "Unexpected error, try again!"
            })
        }
    },
    resetForm(req, res){
        return res.render("session/password-reset", { token: req.query.token })
    },
    async reset(req, res){

        const user = req.user

        const { password, token } = req.body

        try {   
        //  Criate a new hash of password
            const newPassword = await hash(password, 8)

        //  Update the user
            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: "",
            })
        //  Warns the user that he a new password
            return res.render("session/login", {
                user: req.boby,
                success: "Password upadated! Make the you login."
            })

        }catch(err) {
            console.error(err)
            return res.render("session/password-reset", {
                user: req.body, 
                token, 
                error: "Unexpected error, try again!"
            })
        }
    }
}