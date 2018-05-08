var crypto = require("crypto");
var eccrypto = require("eccrypto");
var protobuf = require("google-protobuf");
const secp256k1 = require('secp256k1')

/**
 * create public key and private key
 */
const createPubPrivateKeys = ()=>{
    let privateKey = crypto.randomBytes(32)
    let publicKey = eccrypto.getPublic(privateKey)

    return {privateKey,publicKey}
}

/**
 * create proto buffer by protojs and json message
 * @param {*proto file in javascript} protojs 
 * @param {* JSON Object} msg message for sign
 */
const protobufEncode = (protojs,msg)=>{
    const ProtoMsg = new protojs.Message()

    ProtoMsg.setVersion(msg.version)
    ProtoMsg.setCursornum(msg.cursornum)
    ProtoMsg.setCursorLabel(msg.cursorlabel)
    ProtoMsg.setLifetime(msg.lifetime)
    ProtoMsg.setSender(msg.sender)
    ProtoMsg.setContract(msg.contract)
    ProtoMsg.setMethod(msg.method)
    ProtoMsg.setParam(new Uint8Array(msg.param))
    ProtoMsg.setSigAlg(msg.sigalg)
    ProtoMsg.setSignature(msg.signature)

    return ProtoMsg.serializeBinary();
}

/**
 * sign message
 * @param {* string} msg sign message 
 * @param {*} privateKey privateKey
 */
const sign = (msg,privateKey)=>{
    const signObj = secp256k1.sign(msg,privateKey)
    return signObj.signature;
}

/**
 * verify the public key
 * @param {* buffer} privateKey 
 * @param {* buffer } pubKey 
 */
const isPublicKey = (privateKey,pubKey)=>{
    let publicKey = eccrypto.getPublic(privateKey)
    return publicKey.toString('hex')==pubKey.toString('hex')
}

/**
 * verify the sign and signed message
 * @param {* buffer} protoEncode proto encode buffer
 * @param {* buffer} sign sign buffer
 * @param {* buffer} publicKey private key
 */
const verify = (protoEncode,sign,publicKey)=>{
    let msg = crypto.createHash("sha256").update(buf2hex(protoEncode.buffer)).digest()
    return secp256k1.verify(msg,sign,publicKey)
}

/**
 * aes encrypto
 * @param {* string} message 
 * @param {* string} secretKey 
 */
const aesEncrypto = (message,secretKey)=>{
    return cryptojs.AES.encrypt(message, secretKey);
}

/**
 * aes decrypto
 * @param {* buffer} aesSecretMessage 
 * @param {* string} secretKey 
 */
const aesDecrypto = (aesSecretMessage, secretKey)=>{
    let bytes  = cryptojs.AES.decrypt(aesSecretMessage, secretKey);
    let plaintext = bytes.toString(cryptojs.enc.Utf8);
    return plaintext;
}

/**
 * buffer type to string
 * @param {* buffer} buffer 
 */
const buf2hex = (buffer)=>{
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

const sha256 = (msg)=>{
    return crypto.createHash("sha256").update(msg).digest()
}

module.exports = {
    createPubPrivateKeys,
    isPublicKey,
    protobufEncode,
    sign,
    verify,
    aesEncrypto,
    aesDecrypto,
    buf2hex,
    sha256
}
