module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getGuests(res, mysql, context, complete){
        var sql = "SELECT gid, CONCAT(first_name, ' ', last_name) AS 'fullname' from guests \
        where rid is null"
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.guests = results;
            complete();
        });
    }

    function getAvailableRooms(res, mysql, context, complete){
        var sql = "SELECT rid, CONCAT(floor_number, '-', room_number) AS 'floor_room' from rooms \
        where available = 1"
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.rooms = results;
            complete();
        });
    }

    function getCheck_in_outs(res, mysql, context, complete){
        var sql = "SELECT check_in_out.rid, check_in_out.check_in_date, check_in_out.check_out_date, \
        CONCAT(rooms.floor_number, '-', rooms.room_number) AS 'floor_room', \
        CONCAT(guests.first_name, ' ', guests.last_name) AS 'fullname' \
        FROM check_in_out \
        INNER JOIN rooms \
        ON check_in_out.rid = rooms.rid \
        Inner JOIN guests \
        ON check_in_out.rid = guests.rid"
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.check_in_outs = results;
            complete();
        });
    }

    function getCheck_out_guest(res, mysql, context, complete){
        var sql = "SELECT guests.first_name, guests.last_name, guests.rid, guests.gid, \
        check_in_out.check_in_date, check_in_out.check_out_date \
        FROM guests \
        INNER JOIN check_in_out \
        ON guests.rid = check_in_out.rid \
        WHERE guests.rid IS NOT null"
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.guest_check_out = results;
            complete();
        });
    }

    function getCheck_in_out(res, mysql, context, sid, complete){
        var sql = "SELECT sid, available, floor_number, check_in_out_number, capacity \
        FROM check_in_outs WHERE sid = ?;";
        var inserts = [sid];
        console.log(sql);
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.check_in_out = results[0];
            console.log(results[0]);
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["checkout.js"];
        var mysql = req.app.get('mysql');
        getCheck_in_outs(res, mysql, context, complete);
        getCheck_out_guest(res, mysql, context, complete);
        getGuests(res, mysql, context, complete);
        getAvailableRooms(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                res.render('check_in_out', context);
            }
        }
    });

    /* Display one check_in_out for the specific purpose of updating check_in_out */

    router.get('/:sid', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedcheck_in_out.js","updatecheck_in_out.js"];
        var mysql = req.app.get('mysql');
        getCheck_in_out(res, mysql, context, req.params.sid, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-check_in_out', context);
            }
        }
    });

    router.post('/', function(req, res){
        valid_value = true
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO check_in_out (rid, check_in_date, check_out_date) VALUES (?,?,?)";
        var sql_update = "UPDATE guests SET rid = ? WHERE gid = ?";
        var sql_update_room = "UPDATE rooms SET available = 0 WHERE rid = ?";
        var inserts = [req.body.rid, req.body.check_in_date, req.body.check_out_date];
        var inserts_update = [req.body.rid, req.body.gid];
        var inserts_update_room = [req.body.rid];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write("Error Found");
                res.write("\r")
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log(req.body);
                //res.redirect('/check_in_out');
            }
        });
        sql_update = mysql.pool.query(sql_update,inserts_update,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write("Error Found");
                res.write("\r")
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log(req.body);
            }
        });
        sql_update_room = mysql.pool.query(sql_update_room,inserts_update_room,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write("Error Found");
                res.write("\r")
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log(req.body);
                res.redirect('/check_in_out');
            }
        });          
    });

     /* The URI that update data is sent to in order to update a check_in_out */

     router.put('/:sid', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE check_in_outs SET available=?, floor_number=?, check_in_out_number=?, capacity=? WHERE sid=?";
        var inserts = [req.body.available, req.body.floor_number, req.body.check_in_out_number, req.body.capacity, req.params.sid];
        console.log("attempt update: ")
        valid_value = checkInput(req.body);
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

    router.delete('/:rid/:gid', function(req, res){
        var mysql = req.app.get('mysql');
        console.log("attempt delete for rid, gid");
        var sql = "DELETE FROM check_in_out WHERE rid = ?";
        var inserts = [req.params.rid];
        var sql_update = "UPDATE guests SET rid = NULL WHERE gid = ?";
        var inserts_update = [req.params.gid];
        var sql_update_room = "UPDATE rooms SET available = 1 WHERE rid = ?";
        var inserts_update_room = [req.params.rid];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                console.log("checked out guest")
            }
        })
        sql_update = mysql.pool.query(sql_update,inserts_update,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write("Error Found");
                res.write("\r")
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log("removed room from guest")
            }
        });
        sql_update_room = mysql.pool.query(sql_update_room,inserts_update_room,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write("Error Found");
                res.write("\r")
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log("update room status")
                res.status(202).end();
            }
        }); 
    })

    return router;
}();
