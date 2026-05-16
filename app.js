var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Mux = require('@mux/mux-node');
var cors = require('cors');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var muxRouter = require('./routes/mux');

var app = express();

function logStartupStream() {
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    console.warn('Mux credentials not configured; skipping startup stream');
    return;
  }

  var mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
  });

  mux.video.liveStreams
    .create({
      playback_policies: ['public'],
      new_asset_settings: { playback_policies: ['public'] },
      test: true,
    })
    .then(function (stream) {
      console.log('Mux live stream created on startup');
      console.log({
        id: stream.id,
        streamKey: stream.stream_key,
        playbackId: stream.playback_ids && stream.playback_ids[0]
          ? stream.playback_ids[0].id
          : null,
        rtmpsUrl: stream.rtmps ? stream.rtmps.url : null,
      });
    })
    .catch(function (error) {
      console.error('Failed to create Mux live stream on startup', error);
    });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/mux', muxRouter);

logStartupStream();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
