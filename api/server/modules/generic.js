var date = require('date-and-time');
var bcrypt = require('bcrypt');

var mongo_ObjectID = require('mongodb').ObjectID;

module.exports = {
    currentTime: function () {
        return new Date().getTime();
    },
    currentTimestamp: function(){
        return Math.floor(Date.now() / 1000);
    },
    currentDate:function(){
        var now = new Date();
        ret = date.format(now, 'YYYY-M-D');  
        return ret;
    },
    currentDateTimeDay:function(){
        var now = new Date();
        return date.format(now, 'E YYYY-MMM-DD HH:mm:ss A');
    },
    currentIsoDate: function(){
        return new Date();
    },
    encode_password : function( string, callback ){
        bcrypt.hash( string, 10, function(err, hash){
            callback( hash );
        });
    },
    match_encode_password : function( p1, p2, callback ){
        // here 2nd param p2 will be encoded string
        bcrypt.compare( p1, p2, function(err, val){
            if (val){
                callback( true );
            }else{
                callback( false );
            }
        })
    },
    get_random_number : function( ){
        return Math.floor(Math.random() * 9000) + 1000;
    },
    get_user_public_view : function( row ){
        var public_row = {
            user_id : row.id,
            name : row.name,
            profile_image : row.profile_image,
        };
        //console.log( row );
        console.log( public_row)
        console.log('\n');
        console.log( '-------');
        console.log('\n');
        return public_row;
    },
    get_mongo_objectid : function( string ){
        return mongo_ObjectID( string );
    }
}