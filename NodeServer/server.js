//Dependencies
var bcrypt = require('bcryptjs')
    , bodyParser = require('body-parser')
    , cors = require('cors')
    , express = require('express')
    , logger = require('morgan')
    , jwt = require('jwt-simple')
    , moment = require('moment')
    , cron = require('node-cron')
    , mongoose = require('mongoose')
    , Vimeo = require('vimeo').Vimeo
    , userRoles = require('Ndcproject/routingConfig.js').userRoles;

//Config
var config = require('./config');

//Vimeo API variables
var vimeoClientID = 'xxxxxxxxxx';
var vimeoClientSecret = 'xxxxxxxxxxxxxxxx';
var vimeoAccessToken = 'xxxxxxxxxxxx';
var vimeo_redirect_uri = 'xxxxxxxxxxxx';
var lib = new Vimeo(vimeoClientID, vimeoClientSecret, vimeoAccessToken);
var lib2 = new Vimeo(vimeoClientID, vimeoClientSecret, 'xxxxxxxxxxxx');

//User Schema
var userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: String
});

var accessSchema = new mongoose.Schema({
    accesscode: String
})

//Save function for the User Schema
userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});

//Compares the incoming password with the password in the database
userSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

//Access Schema
var accessSchema = new mongoose.Schema({
    accesscode: String
});

//Videos Schema
var videoSchema = new mongoose.Schema({
    iframe: String,
    title: String
});

//MostViewed Videos Schema
var mostviewedSchema = new mongoose.Schema({
    iframe: String,
    title: String
});

//Public Videos Schema
var videopublicSchema = new mongoose.Schema({
    iframe: String,
    title: String
});

//Models
var MostViewed      = mongoose.model('MostViewed', mostviewedSchema);
var Video           = mongoose.model('Video', videoSchema);
var VideoPublic     = mongoose.model('VideoPublic', videopublicSchema);
var User            = mongoose.model('User', userSchema);
var Access          = mongoose.model('Access', accessSchema);

//MongoDB connection
mongoose.connect(config.MONGO_URI);
mongoose.connection.on('error', function(err) {
  console.log('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

var app = express();

//Set the server port number and that CORS data
app.set('port', process.env.PORT || 3000);
app.use(cors({
    credentials: true,
    origin: 'http://localhost:50600'
}));

//Server enviroment variables
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

initializeServer();
cron.schedule('20 * * * *', function () {
    console.log('fetching videos from Vimeo API, done every 20 minutes');
    initializeServer();
});

function initializeServer() {
    Video.remove({}, function (err) {
        console.log('data removed from Video');
    });
    VideoPublic.remove({}, function (err) {
        console.log('data removed from VideoPublic');
    });
    MostViewed.remove({}, function (err) {
        console.log('data removed from MostViewed');
    });
    Access.findOneAndUpdate({ accesscode: 'ndc2016' }, { new: true }, { upsert: true }, function (err, doc) {
        if (err) {
            console.log('Error');
        }
    });
    getTotalVids(lib);
    getTotalVidsPublic(lib2)
}

/*
 |--------------------------------------------------------------------------
 | Vimeo video functions
 |--------------------------------------------------------------------------
 */

//Gets the number of pages on the vimeo user
//50 videos = 1 page
var totalVidsNum;
var totalVidsPublicOnly;

function getTotalVids(lib) {
    // Make an API request
    lib.request({
        // This is the path for the videos contained within the staff picks channels
        path: '/users/ndcconferences/videos',
        query: {
            page: 1,
            per_page: 1
        }
    }, function (error, body, status_code, headers) {
        if (error) {
        } else {
            var totalVids = body.total;
            totalVidsNum = parseInt(totalVids / 50) + 1;
            getAllVideos(lib);
            mostViewedVids(lib);
        }
    });
}

function getTotalVidsPublic(lib2) {
    // Make an API request
    lib2.request({
        // This is the path for the videos contained within the staff picks channels
        path: '/users/ndcconferences/videos',
        query: {
            page: 1,
            per_page: 1
        }
    }, function (error, body, status_code, headers) {
        if (error) {
        } else {
            var totalVids = body.total;
            totalVidsPublicOnly = parseInt(totalVids / 50) + 1;
            getAllPublicVideos(lib2);
        }
    });
}

//Get all the videos, private and public, that the vimeo user has uploaded
function getAllVideos(lib) {

    var i = 1;
    (function request(i) {
        if (i <= totalVidsNum) {
            lib.request({
                path: '/users/ndcconferences/videos',
                query: {
                    page: i,
                    per_page: 50,
                    sort: "date"
                }
            }, function (error, body, status_code, headers) {
                if (error) {
                } else {
                    var totalbody = body.total;
                    console.log('page: ' + i);
                    for (var p = 0; p < 50; p++) {
                        if (body.data[p] == null) {
                            break;

                        } else {
                            var bodydata = body.data[p].uri;
                            var videoID = bodydata.lastIndexOf('/');
                            //var res = bodydata.substring(8, 17);
                            var result = bodydata.substring(videoID + 1);
                            var title = body.data[p].name;

                            var vimeovid = new Video({
                                iframe: result,
                                title: title
                            });
                            vimeovid.save(function (err, data) {
                                if (err) {
                                    console.log(err);
                                } else {
                                }
                            });
                        }
                    }
                }
                request(++i);
            });
        }
    })(0);
}

//Get all the videos, only public, that the vimeo user has uploaded
function getAllPublicVideos(lib2) {
    var i = 1;
    (function request(i) {
        if (i <= totalVidsPublicOnly) {
            lib2.request({
                path: '/users/ndcconferences/videos',
                query: {
                    page: i,
                    per_page: 50,
                    sort: "date"
                }
            }, function (error, body, status_code, headers) {
                if (error) {
                } else {
                    var totalbody = body.total;
                    console.log('page: ' + i);
                    for (var p = 0; p < 50; p++) {
                        if (body.data[p] == null) {
                            break;

                        } else {
                            var bodydata = body.data[p].uri;
                            var videoID = bodydata.lastIndexOf('/');
                            //var res = bodydata.substring(8, 17);
                            var result = bodydata.substring(videoID + 1);
                            var title = body.data[p].name;

                            var vimeovid = new VideoPublic({
                                iframe: result,
                                title: title
                            });
                            vimeovid.save(function (err, data) {
                                if (err) {
                                    console.log(err);
                                } else {
                                }
                            });
                        }
                    }
                }
                request(++i);
            });
        }
    })(0);
}

//Get the most viewed videos from the vimeo user
function mostViewedVids(lib) {
    lib.request({
        path: '/users/ndcconferences/videos',
        query: {
            page: 1,
            per_page: 8,
            sort: "plays"
        }
    }, function (error, body, status_code, headers) {
        if (error) {
        } else {
            for (i = 0; i < 8; i++) {
                var mostviewsdata = body.data[i].uri;
                var videoID = mostviewsdata.lastIndexOf('/');
                //var res = mostviewsdata.substring(8, 17);
                var result = mostviewsdata.substring(videoID + 1);
                var title = body.data[i].name;

                var mostViewedVid = new MostViewed({
                    iframe: result,
                    title: title
                });
                mostViewedVid.save(function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                    }
                });
            }
        }
    });
}


/*
 |--------------------------------------------------------------------------
 | API /api/videos and /api/mostviewed
 |--------------------------------------------------------------------------
 */

app.get('/api/videos', ensureAuthenticated, function (req, res) {
    if (req.user != null) {
        Video.find({}, { _id: 0, iframe: 1, title: 1 }, function (err, docs) {
            res.json(docs);
        });
    } else {
        VideoPublic.find({}, { _id: 0, iframe: 1, title: 1 }, function (err, docs) {
            res.json(docs);
        });
    }
});

app.get('/api/mostviewed', ensureAuthenticated, function (req, res) {
    if (req.user != null) {
        MostViewed.find({}, { _id: 0, iframe: 1, title: 1 }, function (err, docs) {
            res.json(docs);
        });
    }
    else {
        return res.status(401).send({ message: 'Unauthorized' });
        
    }
});

/*
 |--------------------------------------------------------------------------
 | API /api/me
 |--------------------------------------------------------------------------
 */
app.get('/api/me', ensureAuthenticated, function (req, res) {
    if (req.role != null) {
        User.findById(req.user, { role: 0 }, function (err, user) {
            res.send(user);
        });
    }
    else {
        return res.status(401).send({ message: 'Unauthorized' });
    }
});

app.put('/api/me', ensureAuthenticated, function (req, res) {
    User.findById(req.user, function (err, user) {
        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }
        user.email = req.body.email || user.email;
        user.save(function (err) {
            res.status(200).end();
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | API /api/admin
 |--------------------------------------------------------------------------
 */

app.get('/api/isadmin', ensureAuthenticated, function (req, res) {
    if (req.user == null) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    else if (req.role == 'user') {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    else if (req.role == 'admin') {
        User.findById(req.user, function (err, user) {
            res.send(user);
        });
    }
});

/*
 |--------------------------------------------------------------------------
 | API /api/accesscode
 |--------------------------------------------------------------------------
 */

app.get('/api/accesscode', ensureAuthenticated, function (req, res) {
    if (req.role == 'user' || req.role == null) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    else if (req.role == 'admin') {
        Access.find(function (err, access) {
            if (err) {
                res.send(err);
            }
            res.json(access);
        });
    }
});

app.post('/api/accesscode', ensureAuthenticated, function (req, res) {
    if (req.role == 'user' || req.role == null) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    else if (req.role == 'admin') {
        Access.create({
            accesscode: req.body.accesscode
        }, function (err, access) {
            if (err) {
                res.send(err);
            }

            Access.find(function (err, access) {
                if (err) {
                    res.send(err);
                }
                res.json(access);
            });
        });
    }
});


app.delete('/api/accesscode/:access_id', ensureAuthenticated, function (req, res) {
    if (req.role == 'user' || req.role == null) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    else if (req.role == 'admin') {
        Access.remove({
            _id: req.params.access_id
        }, function (err, access) {
            if (err) {
                res.send(err);
            }
            Access.find(function (err, access) {
                if (err) {
                    res.send(err);
                }
                res.json(access);
            });
        });
    }
});

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */

function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
        req.user = null;
        next();
    }
    else {
        var token = req.header('Authorization').split(' ')[1];

        var payload = null;
        try {
            payload = jwt.decode(token, config.TOKEN_SECRET);
        }
        catch (err) {
            return res.status(401).send({ message: err.message });
        }

        if (payload.exp <= moment().unix()) {

            return res.status(401).send({ message: 'Token has expired' });
        }
        req.user = payload.sub;
        req.role = payload.role;
        next();
    }
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
}


/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function (req, res) {
    var code;
    Access.findOne({ accesscode: req.body.access }, function (err, data) {
        if (data) {
            code = data.accesscode;
        }
    });

    User.findOne({ email: req.body.email }, '+password', function (err, user) {
        if (!user) {
            return res.status(401).send({ message: 'Invalid email and/or password' });
        }
        else if (code != req.body.access) {
            return res.status(409).send({ message: 'Access code is wrong' });
        }
        user.comparePassword(req.body.password, function (err, isMatch) {
            if (!isMatch) {
                return res.status(401).send({ message: 'Invalid email and/or password' });
            }
            res.send({ token: createJWT(user) });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Create Email and Password Account
 |--------------------------------------------------------------------------
 */
app.post('/auth/signup', function (req, res) {

    var code;
    Access.findOne({ accesscode: req.body.access }, function (err, data) {
        if (data) {
            code = data.accesscode;
        }
    });

    User.findOne({ email: req.body.email }, function (err, existingUser) {
        if (existingUser) {
            return res.status(409).send({ message: 'Email is already taken' });
        }
        else if (code != req.body.access) {
            return res.status(409).send({ message: 'Access code is wrong' });
        }
        else {
            var user = new User({
                email: req.body.email,
                password: req.body.password,
                role: userRoles.user.title
            });
        }
        user.save(function (err, result) {
            if (err) {
                res.status(500).send({ message: err.message });
            }
            res.send({ token: createJWT(result) });
        });
    });
});

/*
 |--------------------------------------------------------------------------
 | Start the Server
 |--------------------------------------------------------------------------
 */
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = {
    server: server
};