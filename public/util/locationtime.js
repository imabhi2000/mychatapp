function locationtime(username , url){
    return {
        username:username,
        url:url,
        createdtime:new Date().getTime()
    }
}
module.exports = {locationtime};