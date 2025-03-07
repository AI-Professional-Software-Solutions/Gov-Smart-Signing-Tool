
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_public_certificate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
