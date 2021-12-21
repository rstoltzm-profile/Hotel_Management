var express = require('express');
var app     = express();
var mysql = require('./db-connector.js');
var bodyParser = require('body-parser');
PORT        = 4141;


var handlebars = require('express-handlebars').create({
        defaultLayout:'main',
        });

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));

app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);

app.use('/people', require('./people.js'));
app.use('/rooms', require('./rooms.js'));
app.use('/packages', require('./packages.js'));
app.use('/check_in_out', require('./check_in_out.js'));
app.use('/', express.static('public'));

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});

