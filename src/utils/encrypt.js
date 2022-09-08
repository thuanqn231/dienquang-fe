import { sha512 } from 'js-sha512';

const secretKey = "DTH@us-L1m1ted-C0mp@ny-Vietnammm";

const encryptPassword = (plaintextPassword) => {
    const encryptedPasswordWithKey = sha512.hmac(secretKey, plaintextPassword);
    return encryptedPasswordWithKey;
}

export { encryptPassword };