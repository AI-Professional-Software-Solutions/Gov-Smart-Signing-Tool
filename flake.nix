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
          clang
          webkitgtk_4_1
          nettle
          pnpm
          openssl
          llvmPackages.bintools
          rustup
        ];

        nativeBuildPackages = with pkgs; [
          pkg-config
          gobject-introspection
          cargo
          rustc
          cargo-tauri
          nodejs
        ];

        libraries = with pkgs; [

          gtk3

          cairo

          gdk-pixbuf

         nettle
          glib

          dbus

          libclang
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
            # exec /run/current-system/sw/bin/zsh
            export LD_LIBRARY_PATH="${lib.makeLibraryPath libraries}:$LD_LIBRARY_PATH"

            export OPENSSL_INCLUDE_DIR="${openssl.dev}/include/openssl"

            export GIO_MODULE_DIR="${pkgs.glib-networking}/lib/gio/modules"

            export OPENSSL_LIB_DIR="${openssl.out}/lib"

            export OPENSSL_ROOT_DIR="${openssl.out}"

            export LIBCLANG_PATH="${pkgs.llvmPackages.libclang.lib}/lib"

            export RUST_SRC_PATH="${toolchain}/lib/rustlib/src/rust/library"

            export RUSTC_VERSION=stable
          '';

           BINDGEN_EXTRA_CLANG_ARGS =
    # Includes normal include path
    (builtins.map (a: ''-I"${a}/include"'') [
      # add dev libraries here (e.g. pkgs.libvmi.dev)
      pkgs.glibc.dev
    ])
    # Includes with special directory paths
    ++ [
      ''-I"${pkgs.llvmPackages_latest.libclang.lib}/lib/clang/${pkgs.llvmPackages_latest.libclang.version}/include"''
      ''-I"${pkgs.glib.dev}/include/glib-2.0"''
      ''-I${pkgs.glib.out}/lib/glib-2.0/include/''
    ];
        };
      }
    );
}
