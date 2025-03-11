import forge from 'node-forge';

const derHex = '';
const sigHex = '9aaef2b8ed7bf6d0515a858236a82535c47c16d81954f8915b12f448d0a9edfe29d66833cac267713e5b4fc0576002cd6eb7caa16efe5bdd61d32ea715eb1c74c1ecd92d343c501c62d56aec722378b937ec1d008c8a6d4a061250c502dcc0c6a96f110532b7c2b6a6b050026205d84621bf4887d424a1cef2221c32265db0f33ed5de0357ccc6315a222af5e321165ff98c8085d7e4ae0067be6b0787adc523a5b5d062ea5eeee57ac59d217f1bea39e0c675cdc296692427154cf5f04a2a4d3a181ae16bf3a541e770690395d55938bfa60fbfe0a8df0eca9762fc91d08e2602f621f34f75ca5e1aae57cbfb2c9943e0609755e1aad82fa714e0044d59e93e';
const messageSigned = 'hash';

console.log('Certificate hex length:', derHex.length);
console.log('Signature hex length:', sigHex.length);

try {
  const derBytes = forge.util.hexToBytes(derHex);
  console.log('DER bytes length:', derBytes.length);
  
  const asn1Obj = forge.asn1.fromDer(derBytes);
  const cert = forge.pki.certificateFromAsn1(asn1Obj);
  
  const md = forge.md.sha256.create();
  
  const publicKey = cert.publicKey;
  const signatureBytes = forge.util.hexToBytes(sigHex);
  md.update(messageSigned, 'utf8');

  console.log('Message:', md.digest().toHex());
  
  const verified = publicKey.verify(md.digest().bytes(), signatureBytes);
  
  console.log('Signature verification:', verified ? 'succeeded' : 'failed');
  
  console.log('Certificate Subject:', cert.subject.attributes.map(a => `${a.shortName || a.name}=${a.value}`).join(', '));
  console.log('Certificate Issuer:', cert.issuer.attributes.map(a => `${a.shortName || a.name}=${a.value}`).join(', '));
  console.log('Serial Number:', cert.serialNumber);
  console.log('Valid From:', cert.validity.notBefore);
  console.log('Valid To:', cert.validity.notAfter);
  console.log('Signature Algorithm OID:', cert.siginfo.algorithmOid);
} catch (err) {
  console.error('Error during processing:', err);
}
