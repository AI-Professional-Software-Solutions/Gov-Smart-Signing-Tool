#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use cryptoki::context::{CInitializeArgs, Pkcs11};
use cryptoki::mechanism::Mechanism;
use cryptoki::object::{Attribute, AttributeType, KeyType, ObjectClass};
use cryptoki::session::UserType;
use cryptoki::slot::Slot;
use cryptoki::types::AuthPin;
use openssl::nid::Nid;
use openssl::x509::X509;
use std::error::Error;

#[derive(Debug)]
pub enum PublicKey {
    Rsa { modulus: Vec<u8>, exponent: Vec<u8> },
    Ec { ec_point: Vec<u8> },
}

#[derive(Debug)]
pub struct CertifiedKey {
    pub certificate: Vec<u8>,
    pub public_key: PublicKey,
}

pub fn get_pkcs_11() -> Result<Pkcs11, Box<dyn Error>> {
    let pkcs11 = Pkcs11::new()?;
    pkcs11.initialize(CInitializeArgs::OsThreads)?;
    Ok(pkcs11)
}

pub fn mechanism_from_cert(cert: &X509) -> Result<Mechanism, Box<dyn Error>> {
    let sig_alg_nid = cert.signature_algorithm().object().nid();

    match sig_alg_nid {
        Nid::SHA1WITHRSAENCRYPTION => Ok(Mechanism::Sha1RsaPkcs),
        Nid::SHA224WITHRSAENCRYPTION => Ok(Mechanism::Sha224RsaPkcs),
        Nid::SHA256WITHRSAENCRYPTION => Ok(Mechanism::Sha256RsaPkcs),
        Nid::SHA384WITHRSAENCRYPTION => Ok(Mechanism::Sha384RsaPkcs),
        Nid::SHA512WITHRSAENCRYPTION => Ok(Mechanism::Sha512RsaPkcs),
        Nid::RSAENCRYPTION => Ok(Mechanism::RsaPkcs),

        Nid::ECDSA_WITH_SHA1 => Ok(Mechanism::EcdsaSha1),
        Nid::ECDSA_WITH_SHA224 => Ok(Mechanism::EcdsaSha224),
        Nid::ECDSA_WITH_SHA256 => Ok(Mechanism::EcdsaSha256),
        Nid::ECDSA_WITH_SHA384 => Ok(Mechanism::EcdsaSha384),
        Nid::ECDSA_WITH_SHA512 => Ok(Mechanism::EcdsaSha512),

        _ => Err(format!(
            "Unsupported signature algorithm OID with NID: {:?}",
            sig_alg_nid
        )
        .into()),
    }
}

pub fn extract_certificate_wrapper(user_pin: &str) -> Result<String, Box<dyn Error>> {
    let pkcs11 = get_pkcs_11()?;
    let slots = pkcs11.get_slots_with_token()?;
    let slot = slots.get(0).ok_or("No token slot available")?;
    let certificate = extract_certificate(&pkcs11, *slot, user_pin)?;
    Ok(hex::encode(&certificate))
}

pub fn extract_certificate(
    pkcs11: &Pkcs11,
    slot: Slot,
    user_pin: &str,
) -> Result<Vec<u8>, Box<dyn Error>> {
    // Open a read-only session and log in as a user.
    let session = pkcs11.open_ro_session(slot)?;
    session.login(UserType::User, Some(&AuthPin::new(user_pin.into())))?;

    let search_template = vec![Attribute::Class(ObjectClass::CERTIFICATE)];
    let cert_objs = session.find_objects(&search_template)?;

    if cert_objs.is_empty() {
        return Err("No certificate found on the token".into());
    }

    let cert_handle = cert_objs[0];

    let attrs = session.get_attributes(cert_handle, &[AttributeType::Value])?;

    for attr in attrs {
        if let Attribute::Value(cert) = attr {
            return Ok(cert);
        }
    }

    Err("Certificate object found but CKA_VALUE attribute is missing".into())
}

pub fn extract_certified_key(
    pkcs11: &Pkcs11,
    slot: Slot,
    user_pin: &str,
) -> Result<CertifiedKey, Box<dyn Error>> {
    // Open a read-only session and log in.
    let session = pkcs11.open_ro_session(slot)?;
    session.login(UserType::User, Some(&AuthPin::new(user_pin.into())))?;

    // First, search for certificate objects.
    let cert_template = vec![Attribute::Class(ObjectClass::CERTIFICATE)];
    let cert_objs = session.find_objects(&cert_template)?;
    if cert_objs.is_empty() {
        return Err("No certificate found on the token".into());
    }
    let cert_handle = cert_objs[0];

    let cert_attrs =
        session.get_attributes(cert_handle, &[AttributeType::Value, AttributeType::Id])?;
    let mut certificate: Option<Vec<u8>> = None;
    let mut cert_id: Option<Vec<u8>> = None;
    for attr in cert_attrs {
        match attr {
            Attribute::Value(val) => certificate = Some(val),
            Attribute::Id(val) => cert_id = Some(val),
            _ => {}
        }
    }

    let certificate = certificate.ok_or("Certificate value not found")?;

    let mut pub_template = vec![Attribute::Class(ObjectClass::PUBLIC_KEY)];
    if let Some(id) = &cert_id {
        pub_template.push(Attribute::Id(id.clone()));
    }
    let pub_objs = session.find_objects(&pub_template)?;
    if pub_objs.is_empty() {
        return Err("No matching public key found on the token".into());
    }
    let pub_handle = pub_objs[0];

    let pub_attrs = session.get_attributes(
        pub_handle,
        &[
            AttributeType::KeyType,
            AttributeType::Modulus,
            AttributeType::PublicExponent,
            AttributeType::EcPoint,
        ],
    )?;

    let mut key_type: Option<KeyType> = None;
    let mut modulus: Option<Vec<u8>> = None;
    let mut exponent: Option<Vec<u8>> = None;
    let mut ec_point: Option<Vec<u8>> = None;

    for attr in pub_attrs {
        match attr {
            Attribute::KeyType(kt) => key_type = Some(kt),
            Attribute::Modulus(val) => modulus = Some(val),
            Attribute::PublicExponent(val) => exponent = Some(val),
            Attribute::EcPoint(val) => ec_point = Some(val),
            _ => {}
        }
    }

    let public_key = if let Some(KeyType::RSA) = key_type {
        if let (Some(m), Some(e)) = (modulus, exponent) {
            PublicKey::Rsa {
                modulus: m,
                exponent: e,
            }
        } else {
            return Err("Incomplete RSA public key attributes".into());
        }
    } else if let Some(KeyType::EC) = key_type {
        if let Some(point) = ec_point {
            PublicKey::Ec { ec_point: point }
        } else {
            return Err("EC public key attribute (EcPoint) not found".into());
        }
    } else if key_type.is_none() {
        if let Some(point) = ec_point {
            PublicKey::Ec { ec_point: point }
        } else {
            return Err("Could not determine public key type".into());
        }
    } else {
        return Err("Unsupported public key type".into());
    };

    Ok(CertifiedKey {
        certificate,
        public_key,
    })
}

pub fn sign_hash_wrapper(
    user_pin: &str,
    cert_hash: String,
    hash: &[u8],
) -> Result<String, Box<dyn Error>> {
    let pkcs11 = get_pkcs_11()?;
    let slots = pkcs11.get_slots_with_token()?;
    let slot = slots.get(0).ok_or("No token slot available")?;
    let cert_der = hex::decode(cert_hash)?;
    let signature = sign_hash_with_cert(&pkcs11, *slot, user_pin, &cert_der, hash)?;
    Ok(hex::encode(signature))
}

fn sign_hash_with_cert(
    pkcs11: &Pkcs11,
    slot: Slot,
    user_pin: &str,
    cert_der: &[u8],
    hash: &[u8],
) -> Result<Vec<u8>, Box<dyn Error>> {
    let session = pkcs11.open_rw_session(slot)?;
    session.login(UserType::User, Some(&AuthPin::new(user_pin.into())))?;

    let cert_template = vec![Attribute::Class(ObjectClass::CERTIFICATE)];
    let cert_objs = session.find_objects(&cert_template)?;
    if cert_objs.is_empty() {
        return Err("No certificate objects found on the token".into());
    }

    let mut cert_id: Option<Vec<u8>> = None;
    for cert_handle in cert_objs {
        let attrs =
            session.get_attributes(cert_handle, &[AttributeType::Value, AttributeType::Id])?;
        let mut found_value: Option<Vec<u8>> = None;
        let mut found_id: Option<Vec<u8>> = None;
        for attr in attrs {
            match attr {
                Attribute::Value(val) => found_value = Some(val),
                Attribute::Id(val) => found_id = Some(val),
                _ => {}
            }
        }
        if let Some(val) = found_value {
            if val == cert_der {
                cert_id = found_id;
                break;
            }
        }
    }

    let cert_id = cert_id.ok_or("Certificate matching provided DER not found or missing CKA_ID")?;

    let x509 = X509::from_der(cert_der)?;
    let mechanism = mechanism_from_cert(&x509)?;
    println!("Signing hash with mechanism: {:?}", mechanism);

    let priv_template = vec![
        Attribute::Class(ObjectClass::PRIVATE_KEY),
        Attribute::Id(cert_id.clone()),
    ];
    let priv_objs = session.find_objects(&priv_template)?;
    if priv_objs.is_empty() {
        return Err("No matching private key found on the token".into());
    }
    let priv_handle = priv_objs[0];

    let key_type_attr = session.get_attributes(priv_handle, &[AttributeType::KeyType])?;
    let key_type = key_type_attr
        .into_iter()
        .find_map(|attr| {
            if let Attribute::KeyType(kt) = attr {
                Some(kt)
            } else {
                None
            }
        })
        .ok_or("Private key does not have a KeyType attribute")?;

    let mechanism = match key_type {
        KeyType::RSA => Mechanism::Sha256RsaPkcs,
        KeyType::EC => Mechanism::Ecdsa,
        _ => return Err("Unsupported key type for signing".into()),
    };

    println!("Signing hash with mechanism: {:?}", mechanism);
    let signature = session.sign(&mechanism, priv_handle, hash)?;

    println!("Signature generated successfully.");

    Ok(signature)
}

fn main() {
    let cert_der = extract_certificate_wrapper("1234").unwrap();
    let result = sign_hash_wrapper("1234", cert_der, b"hello world");
    match result {
        Ok(value) => println!("Signature: {}", value),
        Err(e) => println!("Error: {}", e),
    }
}
