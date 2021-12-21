module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPeople(res, mysql, context, complete){
        mysql.pool.query("SELECT gid, first_name, last_name, phone_number, customer_date, last_stay, rid FROM guests;", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }

    function getPerson(res, mysql, context, gid, complete){
        var sql = "SELECT gid, first_name, last_name, phone_number, customer_date, last_stay FROM guests WHERE gid = ?";
        var inserts = [gid];
        console.log(sql)
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.person = results[0];
            console.log(results[0])
            complete();
        });
    }

    function getPersonByLast(req, res, mysql, context, complete){
        console.log("attempt search")
        var sql = "SELECT gid, first_name, last_name, phone_number, customer_date, last_stay, rid \
        FROM guests WHERE last_name LIKE " + mysql.pool.escape(req.params.s + '%');
        console.log(sql)
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }

    function getPersonByRoomId(req, res, mysql, context, complete){
        console.log("attempt search for room_id")
        var sql = "SELECT gid, first_name, last_name, phone_number, customer_date, last_stay, rid \
        FROM guests WHERE rid = ? ";
        var inserts = [req.params.roomid_filter]
        console.log(sql, inserts)
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            console.log(results)
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterguest.js","searchguest.js"];
        var mysql = req.app.get('mysql');
        getPeople(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('people', context);
            }
        }
    });

        /* Display one person for the specific purpose of updating people */

    router.get('/:gid', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedperson.js", "updateperson.js"];
        var mysql = req.app.get('mysql');
        getPerson(res, mysql, context, req.params.gid, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-person', context);
            }

        }
    });

    router.get('/filter/:roomid_filter', function(req, res){
        console.log("attempt filter")
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterguest.js","searchguest.js"];
        var mysql = req.app.get('mysql');
        getPersonByRoomId(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('people', context);
            }
        }
    });

    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterguest.js","searchguest.js"];
        var mysql = req.app.get('mysql');
        getPersonByLast(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('people', context);
            }
        }
    });

    router.post('/', function(req, res){
        console.log(req.body.people)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO guests (first_name, last_name, phone_number, customer_date, last_stay) VALUES (?,?,?,?,?)";
        var inserts = [req.body.first_name, req.body.last_name, req.body.phone_number, req.body.customer_date, req.body.last_stay];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/people');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:gid', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.gid)
        var sql = "UPDATE guests SET first_name=?, last_name=?, phone_number=?, customer_date=?, last_stay=? WHERE gid=?";
        var inserts = [req.body.first_name, req.body.last_name, req.body.phone_number, req.body.customer_date, req.body.last_stay, req.params.gid];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    router.delete('/:gid', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.params.gid)
        var sql = "DELETE FROM guests WHERE gid = ?";
        var inserts = [req.params.gid];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();
