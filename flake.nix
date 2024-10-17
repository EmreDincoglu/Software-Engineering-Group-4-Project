{
  description = "NPM React App environment";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  outputs = {self, nixpkgs, flake-utils, ...}: flake-utils.lib.eachDefaultSystem (
    system: 
    let
      pkgs = import nixpkgs {inherit system; config.allowUnfree = true; };
    in
    {
      devShell = with pkgs; pkgs.mkShell {
        buildInputs = [
          nodejs
        ];
      };
    }
  );
}