import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '3s', target: 100 },  // ramp up to 10 users
        { duration: '10s', target: 100 },   // stay at 10 users for 1 minute
        { duration: '3s', target: 0 },   // ramp down to 0 users
    ],
};

export default function () {
    let res = http.get('https://localhost:7043/api/products');

    check(res, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);  // wait for 1 second between requests
}
