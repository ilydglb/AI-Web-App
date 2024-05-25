import { randomBytes } from 'crypto';

const buf = randomBytes(64);

console.log("The random bytes of data generated is: " + buf.toString('hex'));