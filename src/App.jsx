/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import Fingerprint2 from 'fingerprintjs2';
import { FP } from '@fp-pro/client';
import keys from './keys';

import './App.css';

const MockXMLHttpRequest = require('mock-xmlhttprequest');

const MockXhr = MockXMLHttpRequest.newMockXhr();
global.XMLHttpRequest = MockXhr;
MockXhr.onSend = (xhr) => {
  const responseHeaders = { 'Content-Type': 'application/json' };
  const response = xhr.body;
  xhr.respond(200, responseHeaders, response);
};

function App() {
  const [data, setData] = useState({});

  const sendToServer = async (_data) => {
    fetch(`${process.env.REACT_APP_URL}fingerprint`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_data),
    });
  };

  const getFP = (_data) => {
    FP.load({ client: '12345678', region: 'us' }).then((_fp) => {
      _fp.send({ callbackData: true }).then((response) => {
        Object.keys(response).forEach((key) => {
          const newKey = keys[key] ? keys[key] : key;
          let value = response[key] === 0 || response[key] === 1
            ? !!response[key]
            : response[key];
          if (typeof value === 'object') value = JSON.stringify(value);
          _data[newKey] = { ..._data[newKey], fp: value };
        });
        setData(_data);
        sendToServer(_data);
      }).catch((err) => {
        console.log(err);
      });
    });
  };

  const getFingerprint2 = () => {
    Fingerprint2.get({}, (result) => {
      const _data = JSON.parse(JSON.stringify(data));
      result.forEach((e) => { _data[e.key] = { ..._data[e.key], fp2: e.value }; });
      _data.murmur = { fp2: Fingerprint2.x64hash128(result.map((component) => component.value).join(''), 31) };
      getFP(_data);
    });
  };

  useEffect(() => {
    getFingerprint2();
  }, []);

  return (
    <div className="App">
      <div className="title">
        <h2>key</h2>
        <h2>fingerprintjs2</h2>
        <h2>FingerprintJS Pro</h2>
      </div>
      {Object.keys(data).map((elem) => {
        const fp2 = (data[elem].fp2 === undefined ? '---' : data[elem].fp2).toString();
        const fp = (data[elem].fp === undefined ? '---' : data[elem].fp).toString();

        return (
          <div key={elem} className="row">
            <p className="key">{elem}</p>
            <p className="value">{fp2}</p>
            <p className="value">{fp}</p>
          </div>
        );
      })}
    </div>
  );
}

export default App;
