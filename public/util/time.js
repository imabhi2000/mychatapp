function generatetime(username , text){
    return{
        username:username,
        message:text,
        createdtime:new Date().getTime()
    }
}

module.exports = {generatetime};