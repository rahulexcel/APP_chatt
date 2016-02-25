var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('Ca4nS3QStEcpvZdk9iMh0Q');

module.exports = function (Email) {

    Email.newRegisteration = function (data, callback) {
        var subject = '';
        var body = '';
        subject = "Chatt App - Welcome";
        body = "Hello <b>" + data.name + "</b><br><br> Welcome to Chatt App  ";
        if (typeof data.verification_code !== 'undefined' && data.verification_code !== '') {
            body += '<br>Your verification code - ' + data.verification_code;
        }
        Email.send({
            to: data.email,
            from: 'manish@excellencetechnologies.in',
            subject: subject,
            html: body
        }, function (err, mail) {
            console.log('email sent!');
            callback();
        });
    };

    Email.resendVerification = function (data) {
        var subject = '';
        var body = '';
        subject = "Chatt App - Verfication Code";
        body = " Verification code - " + data.verification_code;
        Email.send({
            to: data.email,
            from: 'manish@excellencetechnologies.in',
            subject: subject,
            html: body
        }, function (err, mail) {
            console.log('email sent!');
            callback();
        });
    };

    Email.resendPassword = function (data, callback) {
        var subject = '';
        var body = '';
        subject = "Chatt App - New password";
        body = "Your new password is :: " + data.new_password;
        Email.send({
            to: data.email,
            from: 'manish@excellencetechnologies.in',
            subject: subject,
            html: body
        }, function (err, mail) {
            console.log('email sent!');
            callback();
        });
    };

};
