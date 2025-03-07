import { pki, md, random, util, asn1, pkcs12 } from "node-forge";
import * as Comlink from "comlink";

export interface Attributes {
  commonName: string;
  countryName: string;
  stateOrProvince: string;
  localityName: string;
  organizationName: string;
  organizationalUnitName: string;
}

export const createPKCS12FromPassphrase = (
  p12Password: string,
  seedString: string,
  attributes: Attributes,
): Promise<{ pkcs12File: string; publicKey: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const mdInstance = md.sha256.create();
      mdInstance.update(seedString);
      const seed = mdInstance.digest().getBytes();

      const prng = random.createInstance();
      prng.seedFileSync = () => seed;
      const keypair = pki.rsa.generateKeyPair({ bits: 2048, prng, workers: -1 });

      const cert = pki.createCertificate();
      cert.publicKey = keypair.publicKey;
      cert.serialNumber = "01";
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

      const attrs = [
        { name: "commonName", value: attributes.commonName },
        { name: "countryName", value: attributes.countryName },
        { shortName: "ST", value: attributes.stateOrProvince },
        { name: "localityName", value: attributes.localityName },
        { name: "organizationName", value: attributes.organizationName },
        { shortName: "OU", value: attributes.organizationalUnitName },
      ];
      cert.setSubject(attrs);
      cert.setIssuer(attrs);
      cert.sign(keypair.privateKey, md.sha256.create());

      const p12Asn1 = pkcs12.toPkcs12Asn1(keypair.privateKey, cert, p12Password, {
        algorithm: "3des",
      });
      const p12Der = asn1.toDer(p12Asn1).getBytes();
      const p12Base64 = util.encode64(p12Der);

      resolve({ pkcs12File: p12Base64, publicKey: pki.publicKeyToPem(keypair.publicKey) });
    } catch (error) {
      reject(error);
    }
  });
};

Comlink.expose({ createPKCS12FromPassphrase });
