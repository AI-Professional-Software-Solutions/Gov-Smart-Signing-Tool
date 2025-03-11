{
  inputs = {
    nixpkgs.url = "nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      rust-overlay,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ rust-overlay.overlays.default ];
        };

        toolchain = pkgs.rust-bin.fromRustupToolchainFile ./rust-toolchain.toml;

        packages = with pkgs; [
          at-spi2-atk
          atkmm
          cairo
          gdk-pixbuf
          glib
          gtk3
          harfbuzz
          librsvg
          libsoup_3
          pango
          webkitgtk_4_1
          openssl
        ];

        nativeBuildPackages = with pkgs; [
          pkg-config
          gobject-introspection
          cargo
          cargo-tauri
          nodejs
        ];

        libraries = with pkgs; [

          gtk3

          cairo

          gdk-pixbuf

          glib

          dbus

          openssl

          librsvg

          at-spi2-atk
          atkmm
          cairo
          gdk-pixbuf
          glib
          gtk3
          harfbuzz
          librsvg
          libsoup_3
          pango
          webkitgtk_4_1

          libappindicator-gtk3
          openssl

          pcsclite
        ];

      in
      {

        devShells.default = pkgs.mkShell {
          buildInputs = packages;

          nativeBuildInputs = nativeBuildPackages;

          shellHook = with pkgs; ''
            export LD_LIBRARY_PATH="${lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH"

            export OPENSSL_INCLUDE_DIR="${openssl.dev}/include/openssl"

            export GIO_MODULE_DIR="${pkgs.glib-networking}/lib/gio/modules"

            export OPENSSL_LIB_DIR="${openssl.out}/lib"

            export OPENSSL_ROOT_DIR="${openssl.out}"

            export RUST_SRC_PATH="${toolchain}/lib/rustlib/src/rust/library"
          '';
        };
      }
    );
}
