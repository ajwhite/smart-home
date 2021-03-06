// import Wemo from 'wemo-client';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Logger from 'log4js';
// import {wemo} from './wemo';
import Promise from 'bluebird';
import * as Wemo from './wemo';
import * as Hue from './hue';

Hue.discover();
Wemo.discover();

const app = express();

app.use(cors());
app.use(bodyParser());
app.use(Logger.connectLogger(Logger.getLogger('request'), {
  level: 'auto',
  format: ':remote-addr - :response-timems - ":method :url HTTP/:http-version" :status :content-length ' +
  '":referrer" ":user-agent"'
}));

app.post('/lights/:name/on', (req, resp) => {
  Hue.turnOn(req.params.name);
  resp.json({});
});

app.post('/lights/:name/off', (req, resp) => {
  Hue.turnOff(req.params.name);
  resp.json({});
});

app.get('/lights/:name', (req, resp) => {
  Hue.getGroup(req.params.name)
    .then(result => {
      console.log('group', result)
      resp.json(result)
    })
    .catch(e => resp.status(500).json(e))
});

app.post('/lights/:name', (req, resp) => {
  Hue.setGroupState(req.params.name, req.body)
    .then(result => resp.json({result}))
    .catch(e => resp.status(500).json(e))
})

app.get('/lights', (req, resp) => {
  Hue.getGroups()
    .then(groups => resp.json(groups))
    .catch(e => resp.status(500).json(e))
})

app.post('/outlets/:name/on', (req, resp) => {
  Wemo.turnOn(req.params.name)
    .then(() => resp.json({}))
    .catch(e => resp.status(500).json(e));
});

app.post('/outlets/:name/off', (req, resp) => {
  Wemo.turnOff(req.params.name)
    .then(() => resp.json({}))
    .catch(e => resp.status(500).json(e));
});

app.post('/outlets/all/on', (req, resp) => {
  Wemo.turnAllOn()
    .then(() => resp.json({}))
    .catch(e => resp.status(500).json(e));
});

app.post('/outlets/all/off', (req, resp) => {
  Wemo.turnAllOff()
    .then(() => resp.json({}))
    .catch(e => resp.status(500).json(e));
});

app.get('/outlets/:name', (req, resp) => {
  Wemo.getState(req.params.name)
    .then(state => resp.json({state}))
    .catch(e => resp.status(500).json(e));
});

app.listen(process.env.SMART_HOME_PORT || 4111);
