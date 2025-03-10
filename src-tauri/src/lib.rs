#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use cryptoki::context::{CInitializeArgs, Pkcs11};
use cryptoki::object::{Attribute, AttributeType, ObjectClass};
use cryptoki::session::UserType;
use cryptoki::types::AuthPin;
use std::error::Error;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn get_public_certificate_inner(app: AppHandle) -> Result<String, Box<dyn Error>> {
    let resource_directory: PathBuf = app.path().resource_dir().unwrap();

    let mut pkcs11_lib_path = resource_directory.join("pcks11");
    if cfg!(target_os = "linux") {
        pkcs11_lib_path = pkcs11_lib_path.join("libsofthsm2.so");
    } else if cfg!(target_os = "windows") {
        pkcs11_lib_path = pkcs11_lib_path.join("softhsm2.dll");
    } else if cfg!(target_os = "macos") {
        pkcs11_lib_path = pkcs11_lib_path.join("libsofthsm2.dylib");
    }

    if !pkcs11_lib_path.exists() {
        return Err("PKCS#11 library not found".into());
    }

    let pkcs11 = Pkcs11::new("/nix/store/cq3ljm70ji7mf41zzc056rhqki5xqm4w-softhsm-2.6.1/lib/softhsm/libsofthsm2.so")?;

    pkcs11.initialize(CInitializeArgs::OsThreads)?;

    let slots = pkcs11.get_slots_with_token().map_err(|e| e.to_string())?;
    let slot = slots.get(0).ok_or("No token slot available")?;

    let pin = AuthPin::new("1234".into());

    {
        let session = pkcs11.open_rw_session(*slot)?;
        session.login(UserType::So, Some(&pin))?;
        session.init_pin(&pin)?;
    }

    let session = pkcs11.open_ro_session(*slot)?;
    session.login(UserType::User, Some(&pin))?;

    let search_template = vec![Attribute::Class(ObjectClass::PUBLIC_KEY)];

    let objects = session.find_objects(&search_template)?;

    if objects.is_empty() {
        return Err("No public key found on the token".into());
    }

    let public_key_handle = objects[0];

    let attributes = session.get_attributes(
        public_key_handle,
        &[AttributeType::Modulus, AttributeType::PublicExponent],
    )?;

    let mut modulus: Option<Vec<u8>> = None;
    let mut exponent: Option<Vec<u8>> = None;
    for attr in attributes {
        match attr {
            Attribute::Modulus(val) => modulus = Some(val),
            Attribute::PublicExponent(val) => exponent = Some(val),
            _ => {}
        }
    }

    if let (Some(modulus), Some(exponent)) = (modulus, exponent) {
        let modulus_hex = hex::encode(modulus);
        let exponent_hex = hex::encode(exponent);
        Ok(format!(
            "RSA Public Key:\nModulus: {}\nExponent: {}",
            modulus_hex, exponent_hex
        ))
    } else {
        Err("Could not retrieve both RSA public key attributes".into())
    }
}

#[tauri::command]
fn get_public_certificate(app: AppHandle) -> Result<String, String> {
    match get_public_certificate_inner(app) {
        Ok(certificate) => Ok(certificate),
        Err(e) => Err(e.to_string()),
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_public_certificate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
