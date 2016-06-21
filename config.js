/**
 * config file
 * keeping production and development files separate, please create different files with the name
 * like You should put specific deploayment options under "development.js" or "production.js", etc under the root folder.
 * Those files should look like:
 * exports.update = function(config) {
        config.port = 1337;
    };
 * @author : pradeep kumar baranwal <pradeep.baranwal@cars24.com>
 * 
 */

exports.configure = function() {

    this.port = 8081;
    this.cookieSecret = "whatever1234";
    this.awayTimeout = 60000 * 5; // five minutes
    this.roomTimeout = 60000 * 20; // twenty minutes
    this.checkInterval = 10000; // ten seconds
    this.transports = [ 'htmlfile', 'xhr-multipart', 'xhr-polling',
                        'jsonp-polling' ];
    this.db = {
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'dealerengine_new'
        };
    
    // Configure deployment settings
    if (process.env.NODE_ENV)
        require("./"+process.env.NODE_ENV+".js").update(this);
   
    return this;
};