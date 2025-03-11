#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use cryptoki::context::{CInitializeArgs, Pkcs11};
use cryptoki::mechanism::Mechanism;
use cryptoki::object::{Attribute, AttributeType, KeyType, ObjectClass};
use cryptoki::session::UserType;
use cryptoki::slot::Slot;
use cryptoki::types::AuthPin;
use serde::Deserialize;
use std::error::Error;
use std::path::PathBuf;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri::{AppHandle, Manager};

use std::sync::{Arc, Mutex};
use tokio::sync::oneshot;

#[derive(Debug)]
struct SigningRequest {
    cert_hash: String,
    doc_hash: String,
    response_tx: oneshot::Sender<Result<String, String>>,
}

#[derive(Debug)]
struct SigningState {
    current_request: Mutex<Option<SigningRequest>>,
}

#[derive(Deserialize)]
struct SignDocumentRequest {
    cert_hash: String,
    hash: String, // document hash in hex
}

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

#[derive(Debug)]
struct CertificateRequest {
    response_tx: oneshot::Sender<Result<String, String>>,
}

#[derive(Debug)]
struct CertificateState {
    current_request: Mutex<Option<CertificateRequest>>,
}



pub fn get_pkcs_11(app: AppHandle) -> Result<Pkcs11, Box<dyn Error>> {
    let resource_directory: PathBuf = app.path().resource_dir().unwrap();

    let mut pkcs11_lib_path = resource_directory.join("pcks11");
    if cfg!(target_os = "linux") {
        pkcs11_lib_path = pkcs11_lib_path.join("libeToken.so");
    } else if cfg!(target_os = "windows") {
        pkcs11_lib_path = pkcs11_lib_path.join("IDPrimeTokenEngine.dll");
    } else if cfg!(target_os = "macos") {
        pkcs11_lib_path = pkcs11_lib_path.join("libsofthsm2.dylib");
    }

    if !pkcs11_lib_path.exists() {
        return Err("PKCS#11 library not found".into());
    }

    let pkcs11 = Pkcs11::new(&pkcs11_lib_path)?;
    pkcs11.initialize(CInitializeArgs::OsThreads)?;
    Ok(pkcs11)
}

pub fn extract_certificate_wrapper(
    app: AppHandle,
    user_pin: &str,
) -> Result<String, Box<dyn Error>> {
    let pkcs11 = get_pkcs_11(app)?;
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

pub fn sign_hash_wrapper(
    app: AppHandle,
    user_pin: &str,
    cert_hash: String,
    hash: &[u8],
) -> Result<String, Box<dyn Error>> {
    let pkcs11 = get_pkcs_11(app)?;
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

#[tauri::command]
fn get_certificate(app: tauri::AppHandle, user_pin: String) -> Result<String, String> {
    match extract_certificate_wrapper(app, &user_pin) {
        Ok(cert) => Ok(cert),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn sign_hash(
    app: tauri::AppHandle,
    user_pin: String,
    cert_hash: String,
    hash: String,
) -> Result<String, String> {
    let hash_bytes = hash.as_bytes();
    match sign_hash_wrapper(app, &user_pin, cert_hash, &hash_bytes) {
        Ok(signature) => Ok(signature),
        Err(e) => Err(e.to_string()),
    }
}

pub fn run() {
    let signing_state = Arc::new(SigningState {
        current_request: Mutex::new(None),
    });

    let certificate_state = Arc::new(CertificateState {
        current_request: Mutex::new(None),
    });

    tauri::Builder::default()
        .manage(signing_state.clone())
        .manage(certificate_state.clone())
        .invoke_handler(tauri::generate_handler![
            get_certificate,
            sign_hash,
            complete_signing,
            complete_certificate,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // only if it's the main window
                if window.label() != "main" {
                    return;
                }
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .setup(move |app| {
            let app_handle = app.handle();
            let signing_state_data = signing_state.clone();
            let app_handle_data = web::Data::new(app_handle.clone());
            let certificate_state_data = certificate_state.clone();

            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let tray_menu = Menu::with_items(app, &[&quit, &show])?;

            let _ = TrayIconBuilder::new()
                .menu(&tray_menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("quit menu item was clicked");
                        app.exit(0);
                    }
                    "show" => {
                        println!("show menu item was clicked");
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                        }
                    }
                    _ => {}
                })
                .build(app);

            tauri::async_runtime::spawn(async move {
                HttpServer::new(move || {
                    let cors = Cors::permissive();
                    App::new()
                        .app_data(web::Data::new(signing_state_data.clone()))
                        .app_data(web::Data::new(certificate_state_data.clone()))
                        .app_data(app_handle_data.clone())
                        .service(sign_document)
                        .service(get_certificate_route)
                        .wrap(cors)
                })
                .bind("127.0.0.1:8811")
                .expect("Cannot bind to 127.0.0.1:8811")
                .run()
                .await
                .expect("HTTP server failed");
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
