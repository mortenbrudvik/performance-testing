import http from 'k6/http';
import { check, sleep } from 'k6';

import { SharedArray } from 'k6/data';

let cachedToken = null;

const auth0Config = new SharedArray('auth0 config', function() {
    return JSON.parse(open('./auth0-config.json'));
});

const getToken = () => {
    if (cachedToken) {
        return cachedToken;
    }
    
    const url = `https://${auth0Config[0].domain}/oauth/token`;
    const payload = JSON.stringify({
        client_id: auth0Config[0].clientId,
        client_secret: auth0Config[0].clientSecret,
        audience: auth0Config[0].audience,
        grant_type: 'client_credentials'
    });

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const response = http.post(url, payload, params);
    cachedToken =  response.json().access_token;
    
    console.log('Token:', cachedToken);
    
    return cachedToken;
};


export let options = {
    stages: [
        { duration: '3s', target: 3 },  // ramp up to 10 users
        { duration: '10s', target: 3 },   // stay at 10 users for 1 minute
        { duration: '3s', target: 0 },   // ramp down to 0 users
    ],
};

export default function () {
    const token = getToken();
    const params = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    
    let res = http.get('https://localhost:7043/api/products', params);

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);  // wait for 1 second between requests
}
