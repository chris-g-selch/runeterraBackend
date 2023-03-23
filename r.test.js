const { doesNotMatch } = require('assert');

//find away to increase intelsense
test('Crypto lib installed', () => {
    crypto = require('crypto');
    expect(crypto).not.toBe(null)
})

test('Hash creation test v2', () => {
    const smallHash = require('./utli/smallHash');
    console.log(`hash v2: ${smallHash.encryptPassword('yoyoyo')}`);
})

test('Hash match test v2', () =>{
    const smallHash = require('./utli/smallHash');
    expect(smallHash.matchEncryptedPassword('yoyoyo', 'e9b321a405c88fec4b057293013d8bc5edaf36009d030c7cd360f6a0071d745fb0ba6212a41965dc7360')).toBe(true);
})

