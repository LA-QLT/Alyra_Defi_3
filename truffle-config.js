const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 7545
    }
  },
  // Ajouter cette partie (ou décommenter directement dans le fichier):
  compilers: {
    solc: {
      version: "0.8.7", // Récupérer la version exacte de solc-bin (par défaut : la  version de truffle)
      settings: {  // Voir les documents de solidity pour des conseils sur l'optimisation et l'evmVersion
        optimizer: {
        enabled: false,
        runs: 200
        },
      }
    },
  },
};
