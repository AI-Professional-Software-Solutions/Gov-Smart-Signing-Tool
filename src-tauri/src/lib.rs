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
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::PathBuf;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri::{AppHandle, Manager};

use std::sync::{Arc, Mutex};
use tokio::sync::oneshot;

use tauri_plugin_updater::UpdaterExt;

#[derive(Debug)]
struct SigningRequest {
    cert_hash: String,
    doc_hash: String,
    timestamp: String,
    signed_certificate: String,
    response_tx: oneshot::Sender<Result<String, String>>,
}

#[derive(Debug)]
struct SigningState {
    current_request: Mutex<Option<SigningRequest>>,
}

#[derive(Deserialize)]
struct SignDocumentRequest {
    cert_hash: String,
    hash: String,
    timestamp: String,
    signed_certificate: String,
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

#[derive(Serialize)]
pub struct CertificateInfo {
    id: String,
    label: String,
}

pub fn list_certificates(pkcs11: &Pkcs11) -> Result<Vec<CertificateInfo>, Box<dyn Error>> {
    let mut cert_list = Vec::new();
    let slots = pkcs11.get_slots_with_token()?;
    for slot in slots {
        let session = pkcs11.open_ro_session(slot)?;
        let search_template = vec![Attribute::Class(ObjectClass::CERTIFICATE)];
        let cert_objs = session.find_objects(&search_template)?;
        for cert_handle in cert_objs {
            let attrs =
                session.get_attributes(cert_handle, &[AttributeType::Id, AttributeType::Label])?;
            let mut id = None;
            let mut label = None;
            for attr in attrs {
                match attr {
                    Attribute::Id(val) => id = Some(val),
                    Attribute::Label(val) => label = Some(val),
                    _ => {}
                }
            }
            if let Some(id) = id {
                let id_hex = hex::encode(&id);
                let label_str = label.unwrap_or_else(|| b"Unknown Certificate".to_vec());
                cert_list.push(CertificateInfo {
                    id: id_hex,
                    label: String::from_utf8(label_str).unwrap(),
                });
            }
        }
    }
    Ok(cert_list)
}

pub fn extract_certificate_by_id(
    pkcs11: &Pkcs11,
    slot: Slot,
    cert_id: &[u8],
) -> Result<Vec<u8>, Box<dyn Error>> {
    // Open a read-only session; we do NOT log in since no PIN is required.
    let session = pkcs11.open_ro_session(slot)?;
    let search_template = vec![
        Attribute::Class(ObjectClass::CERTIFICATE),
        Attribute::Id(cert_id.to_vec()),
    ];
    let cert_objs = session.find_objects(&search_template)?;
    if cert_objs.is_empty() {
        return Err("Certificate not found on the token".into());
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

#[get("/certificate")]
async fn get_certificate_route(
    cert_state: web::Data<Arc<CertificateState>>,
    app_handle: web::Data<AppHandle>,
) -> impl Responder {
    let (tx, rx) = oneshot::channel();
    {
        let mut lock = cert_state.current_request.lock().unwrap();
        *lock = Some(CertificateRequest { response_tx: tx });
    }

    // Create the PKCS#11 instance and list available certificates.
    let pkcs11 = match get_pkcs_11(app_handle.get_ref().clone()) {
        Ok(pkcs11) => pkcs11,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };
    let certs = match list_certificates(&pkcs11) {
        Ok(certs) => certs,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // Serialize the certificates list as JSON and URL-encode it.
    let certs_json = serde_json::to_string(&certs).unwrap();
    let certs_param = urlencoding::encode(&certs_json);
    let url_with_params = format!("cert_pin.html?certs={}", certs_param);

    let raw_app_handle = app_handle.get_ref();
    let _ = tauri::WebviewWindowBuilder::new(
        raw_app_handle,
        "cert_popup",
        tauri::WebviewUrl::App(url_with_params.into()),
    )
    .title("Select Certificate")
    .build();

    match rx.await {
        Ok(result) => match result {
            Ok(cert_str) => {
                let cert: serde_json::Value =
                    serde_json::from_str(&cert_str).unwrap_or_else(|_| {
                        serde_json::json!( {
                            "derHex": cert_str,
                            "name": "Unknown Certificate"
                        })
                    });
                HttpResponse::Ok().json(serde_json::json!({ "certificate": cert }))
            }
            Err(err_msg) => HttpResponse::BadRequest().body(err_msg),
        },
        Err(_) => HttpResponse::InternalServerError().body("Failed to receive certificate result"),
    }
}

#[get("/list-certificates")]
async fn list_certificates_route(
    app_handle: web::Data<AppHandle>,
) -> impl Responder {
    // Create the PKCS#11 instance and list available certificates.
    let pkcs11 = match get_pkcs_11(app_handle.get_ref().clone()) {
        Ok(pkcs11) => pkcs11,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };
    
    let certs = match list_certificates(&pkcs11) {
        Ok(certs) => certs,
        Err(e) => return HttpResponse::InternalServerError().body(e.to_string()),
    };

    // Return the certificates directly to the frontend
    HttpResponse::Ok().json(serde_json::json!({ "certificates": certs }))
}

#[tauri::command]
fn complete_certificate(
    window: tauri::Window,
    cert_id: String,
    cert_state: tauri::State<Arc<CertificateState>>,
) -> Result<(), String> {
    let app_handle = window.app_handle();
    let pkcs11 = get_pkcs_11(app_handle.clone()).map_err(|e| e.to_string())?;
    let slots = pkcs11.get_slots_with_token().map_err(|e| e.to_string())?;
    let cert_id_bytes = hex::decode(&cert_id).map_err(|e| e.to_string())?;

    let mut found_cert = None;
    let mut found_label = None;
    for slot in slots {
        if let Ok(cert) = extract_certificate_by_id(&pkcs11, slot, &cert_id_bytes) {
            found_cert = Some(cert);
            if let Ok(cert_list) = list_certificates(&pkcs11) {
                if let Some(cert_info) = cert_list.into_iter().find(|ci| ci.id == cert_id) {
                    found_label = Some(cert_info.label);
                }
            }
            break;
        }
    }

    let cert_bytes = found_cert.ok_or("Certificate not found".to_string())?;
    let label = found_label.unwrap_or_else(|| "Unknown Certificate".into());

    let cert_object = serde_json::json!({
         "derHex": hex::encode(cert_bytes),
         "name": label
    });

    let req = {
        let mut lock = cert_state.current_request.lock().unwrap();
        lock.take().expect("Certificate request expected")
    };
    req.response_tx
        .send(Ok(serde_json::to_string(&cert_object).unwrap()))
        .map_err(|_| "Failed to send certificate extraction result".to_string())?;
    window
        .close()
        .map_err(|err| format!("Failed to close window: {}", err))?;
    Ok(())
}

fn verify_company_signature(
    _app: AppHandle,
    _message: &str,
    _signature: &str,
) -> Result<bool, Box<dyn Error>> {
    Ok(true)
    // let public_key_str = get_public_key_str(app)?;
    // let public_key: SignedPublicKey = SignedPublicKey::from_string(&public_key_str).unwrap().0;
    // public_key.verify().unwrap();
    // let binding = base64::decode(signature)?;
    // let sig_decoded = binding.as_slice();
    // let (StandaloneSignature { signature }, _) =
    //     StandaloneSignature::from_armor_single_buf(sig_decoded)?;
    // println!("Message: {:?}", message);
    // println!("Decoded Signature: {:?}", String::from_utf8(sig_decoded.to_vec()).unwrap());
    // signature.verify(&public_key, message.as_bytes())?;
    // Ok(true)
}

#[derive(Deserialize)]
struct SignDocumentWithPinRequest {
    cert_hash: String,
    hash: String,
    timestamp: String,
    signed_certificate: String,
    pin: String,
}

#[post("/sign-document")]
async fn sign_document(
    req_body: web::Json<SignDocumentWithPinRequest>,
    app_handle: web::Data<AppHandle>,
) -> impl Responder {
    let message = format!("{}_{}", req_body.cert_hash, req_body.timestamp);
    if let Err(e) = verify_company_signature(
        app_handle.get_ref().clone(),
        &message,
        &req_body.signed_certificate,
    ) {
        return HttpResponse::BadRequest().body(format!("Signature verification failed: {}", e));
    }

    match sign_hash_wrapper(
        app_handle.get_ref().clone(),
        &req_body.pin,
        req_body.cert_hash.clone(),
        req_body.hash.as_bytes(),
    ) {
        Ok(signature) => {
            let response = serde_json::json!({ "signature": signature });
            HttpResponse::Ok().json(response)
        }
        Err(e) => HttpResponse::BadRequest().body(format!("Signing failed: {}", e)),
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

pub fn get_public_key_str(app: AppHandle) -> Result<String, Box<dyn Error>> {
    let resource_directory: PathBuf = app.path().resource_dir().unwrap();

    let mut pkcs11_lib_path = resource_directory.join("pcks11");
    pkcs11_lib_path = pkcs11_lib_path.join("gov_smart.pub");

    if !pkcs11_lib_path.exists() {
        return Err("Public key file not found".into());
    }

    let public_key = std::fs::read_to_string(pkcs11_lib_path)?;
    println!("Public key: {}", public_key);
    Ok(public_key)
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
fn complete_signing(
    app: AppHandle,
    window: tauri::Window,
    pin: String,
    state: tauri::State<Arc<SigningState>>,
) -> Result<(), String> {
    let maybe_data = {
        let req_lock = state.current_request.lock().unwrap();
        req_lock
            .as_ref()
            .map(|req| (req.cert_hash.clone(), req.doc_hash.clone()))
    };

    if let Some((cert_hash, doc_hash)) = maybe_data {
        match sign_hash(app, pin, cert_hash, doc_hash) {
            Ok(signature) => {
                let req = {
                    let mut req_lock = state.current_request.lock().unwrap();
                    req_lock.take().expect("Request should be present")
                };
                req.response_tx
                    .send(Ok(signature))
                    .map_err(|_| "Failed to send signature response".to_string())?;
                window
                    .close()
                    .map_err(|_| "Failed to close window".to_string())?;
                Ok(())
            }
            Err(e) => Err(e.to_string()),
        }
    } else {
        Err("No signing request pending".into())
    }
}

async fn update(app: tauri::AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        let mut downloaded = 0;

        update
            .download_and_install(
                |chunk_length, content_length| {
                    downloaded += chunk_length;
                    println!("downloaded {downloaded} from {content_length:?}");
                },
                || {
                    println!("download finished");
                },
            )
            .await?;

        println!("update installed");
        app.restart();
    }

    Ok(())
}

pub fn run() {
    let signing_state = Arc::new(SigningState {
        current_request: Mutex::new(None),
    });

    let certificate_state = Arc::new(CertificateState {
        current_request: Mutex::new(None),
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(signing_state.clone())
        .manage(certificate_state.clone())
        .invoke_handler(tauri::generate_handler![
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

            let handle_clone = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                update(handle_clone).await.unwrap();
            });

            let _icon_image = if cfg!(target_os = "windows") {
                let icon_path = app
                    .path()
                    .resource_dir()
                    .unwrap()
                    .join("icons/tray/32x32.ico");
                let icon_data = std::fs::read(icon_path).expect("Failed to read icon file");
                tauri::image::Image::new_owned(icon_data, 32, 32)
            } else {
                let icon_path = app
                    .path()
                    .resource_dir()
                    .unwrap()
                    .join("icons/tray/32x32.png");
                let icon_data = std::fs::read(icon_path).expect("Failed to read icon file");
                tauri::image::Image::new_owned(icon_data, 32, 32)
            };

            let _ = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(false)
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
                    let cors = Cors::default()
                        .allowed_origin_fn(|origin, _req_head| {
                            origin.as_bytes().ends_with(b".gov-smart.com")
                        })
                        .allowed_origin("https://staging.gov-smart.com")
                        .allowed_origin("https://demo.gov-smart.com")
                        .allow_any_method()
                        .allowed_origin("http://localhost:3000")
                        .allowed_origin("https://gov-smart.com");
                    App::new()
                        .app_data(web::Data::new(signing_state_data.clone()))
                        .app_data(web::Data::new(certificate_state_data.clone()))
                        .app_data(app_handle_data.clone())
                        .service(sign_document)
                        .service(get_certificate_route)
                        .service(list_certificates_route)
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
