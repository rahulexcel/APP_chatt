module.exports = function( ) {
    return function(req, res, next) {
        if( typeof req.query != 'undefined' && typeof req.query.access_token != 'undefined' && typeof req.query.currentTimestamp != 'undefined' ) {
            var User = req.app.models.User;
            var access_token = req.query.access_token;
            var currentTimestamp = req.query.currentTimestamp;
            User.last_seen( access_token, currentTimestamp, function( ignore_param, status, message, data ){
                next();
            })
        }else{
            next();
        }
    };
};