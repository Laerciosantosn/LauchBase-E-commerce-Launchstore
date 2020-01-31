function onlyUsers(req, res, next) {
    if(!req.session.userId){
        return res.redirect('/users/login')  
    }
    next()
}

function isLoggedRediretToUsers(req, res, next) {
    if (req.session.userId){
        return res.redirect('/users')
    }
    next()
}
module.exports = {
    onlyUsers,
    isLoggedRediretToUsers
}