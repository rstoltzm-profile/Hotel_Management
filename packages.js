module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPackages(res, mysql, context, complete){
        mysql.pool.query("SELECT pid, package_name, package_cost FROM packages;", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.packages = results;
            complete();
            console.log(results)
        });
    }

    function getGuests(res, mysql, context, complete){
        var sql = "SELECT gid, CONCAT(first_name, ' ', last_name) AS 'fullname' from guests \
        where rid is not null"
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.guests = results;
            complete();
        });
    }

    function getPackage(res, mysql, context, pid, complete){
        var sql = "SELECT pid, package_name, package_cost FROM packages where pid = ?;";
        var inserts = [pid];
        console.log(sql);
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.package = results[0];
            complete();
            console.log(results[0]);
        });
    }

    function getGuestToPackage(res, mysql, context, complete){
        var sql = "SELECT guest_to_package.gid, guest_to_package.pid, \
        CONCAT(guests.first_name,' ', guests.last_name) AS 'First_Last', packages.package_name \
        FROM guest_to_package \
        INNER JOIN guests ON guest_to_package.gid = guests.gid \
        INNER JOIN packages ON guest_to_package.pid = packages.pid\
        ORDER BY guest_to_package.gid, guest_to_package.pid ASC"
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.guest = results;
            complete();
            console.log(results)
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        context.jsscripts = ["deletepackage.js"];
        getPackages(res, mysql, context, complete);
        getGuestToPackage(res, mysql, context, complete);
        getGuests(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('packages', context);
            }
        }
    });

    router.get('/:pid', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatepackage.js"];
        var mysql = req.app.get('mysql');
        getPackage(res, mysql, context, req.params.pid, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-package', context);
            }
        }
    });

    router.post('/', function(req, res){
        console.log(req.body.packages)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO packages (package_name, package_cost) VALUES (?,?)";
        var inserts = [req.body.package_name, req.body.package_cost];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log(req.body);
                res.redirect('/packages');
            }
        });
    });

    router.post('/assign', function(req, res){
        console.log(req.body.packages)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO guest_to_package (gid, pid) VALUES (?,?)";
        var inserts = [req.body.gid, req.body.pid];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                console.log(req.body);
                res.redirect('/packages');
            }
        });
    });

    router.put('/:pid', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE packages SET package_name=?, package_cost=? WHERE pid=?";
        var inserts = [req.body.package_name, req.body.package_cost, req.params.pid];
        console.log("attempt update: ")
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

    router.delete('/:pid', function(req, res){
        var mysql = req.app.get('mysql');
        console.log(req.params.pid)
        var sql = "DELETE FROM packages WHERE pid = ?";
        var inserts = [req.params.pid];
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

    router.delete('/:gid/:pid', function(req, res){
        var mysql = req.app.get('mysql');
        console.log("attempt delete for gid, pid")
        console.log(req.params.gid)
        console.log(req.params.pid)
        var sql = "DELETE FROM guest_to_package WHERE gid = ? and pid = ?";
        var inserts = [req.params.gid, req.params.pid];
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
