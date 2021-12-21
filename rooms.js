module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getRooms(res, mysql, context, complete){
        mysql.pool.query("SELECT rid, CASE WHEN available = 1 THEN 'Yes' ELSE 'No' END AS 'available', floor_number, room_number, capacity FROM rooms ORDER BY floor_number, room_number;", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.rooms = results;
            complete();
        });
    }

    function getRoom(res, mysql, context, rid, complete){
        var sql = "SELECT rid, available, floor_number, room_number, capacity FROM rooms WHERE rid = ?;";
        var inserts = [rid];
        console.log(sql);
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.room = results[0];
            console.log(results[0]);
            complete();
        });
    }

    function checkInput(input){
        valid_value = true
        if (input.room_number > 20 || input.room_number < 1 || input.floor_number < 1 
            || input.floor_number > 20 || input.capacity < 1 || input.capacity > 10)
        {
            valid_value = false
        }
        return valid_value
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteroom.js","filterroom.js","searchroom.js"];
        var mysql = req.app.get('mysql');
        getRooms(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('rooms', context);
            }
        }
    });

    /* Display one room for the specific purpose of updating room */

    router.get('/:rid', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedroom.js","updateroom.js"];
        var mysql = req.app.get('mysql');
        getRoom(res, mysql, context, req.params.rid, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-room', context);
            }
        }
    });

    router.post('/', function(req, res){
        valid_value = true
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO rooms (available, floor_number, room_number, capacity) VALUES (?,?,?,?)";
        if (req.body.available === 'on'){
            req.body.available = true
        }
        else {
            req.body.available = false
        }
        valid_value = checkInput(req.body);
        // if (req.body.room_number > 20 || req.body.room_number < 1 || req.body.floor_number < 1 
            //|| req.body.floor_number > 20){
           // valid_value = false
        //}
        var inserts = [req.body.available, req.body.floor_number, req.body.room_number, req.body.capacity];
        if (valid_value === true){
            sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                if(error){
                    console.log(JSON.stringify(error))
                    res.write("Error Found");
                    res.write("\r")
                    res.write(JSON.stringify(error));
                    res.end();
                }else{
                    console.log(req.body);
                    res.redirect('/rooms');
                }
            });            
        }
        else {
            return res.send('Input values are not valid');
        }
    });

     /* The URI that update data is sent to in order to update a room */

     router.put('/:rid', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE rooms SET available=?, floor_number=?, room_number=?, capacity=? WHERE rid=?";
        if (req.body.available === 'on'){
            req.body.available = true
        }
        else {
            req.body.available = false
        }
        var inserts = [req.body.available, req.body.floor_number, req.body.room_number, req.body.capacity, req.params.rid];
        console.log("attempt update: ")
        valid_value = checkInput(req.body);
        if (valid_value === true) {
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
        } else {
            var response = "Input values are not valid";
            console.log(response)
        }
    });


    router.delete('/:rid', function(req, res){
        console.log("attempt delete to delete rid: " + req.params.rid)
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM rooms WHERE rid = ?";
        var inserts = [req.params.rid];
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
