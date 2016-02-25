var date = require('date-and-time');
var bcrypt = require('bcrypt');
var moment = require('moment');
var Random = require("random-js");

var mongo_ObjectID = require('mongodb').ObjectID;

module.exports = {
    currentTime: function () {
        return moment().toDate().getTime();
    },
    currentTimestamp: function () {
        return moment().unix();
    },
    currentDate: function (currentTimestamp) {
        ret = moment(currentTimestamp).format('YYYY-M-D');
        return ret;
    },
    currentDateTimeDay: function (currentTimestamp) {
        return  moment(currentTimestamp).format('YYYY-MMM-DD HH:mm:ss A');
    },
    currentIsoDate: function () {
        return moment().toDate();
    },
    encode_password: function (password, callback) {
        bcrypt.hash(password, 10, function (err, hash) {
            if (err) {
                callback(err);
            } else {
                callback(hash);
            }
        });
    },
    match_encode_password: function (password, encodedPassword, callback) {
        // here 2nd param p2 will be encoded password
        bcrypt.compare(password, encodedPassword, function (err, val) {
            if (err) {
                callback(err);
            } else if (val) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },
    get_random_number: function ( ) {
        var random = new Random(Random.engines.mt19937().autoSeed());
        var randomNumber = random.integer(1000, 9999);
        return randomNumber;
    },
    get_mongo_objectid: function (string) {
        return mongo_ObjectID(string);
    }
};