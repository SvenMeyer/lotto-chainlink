const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.

    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 8545,            // Standard Ethereum port (default: none)
     network_id: "*",       // Any network (default: none)
    },

    cldev: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },

    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },

    kovan: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://kovan.infura.io/v3/' + process.env.INFURA_API_KEY);
      },
      network_id: "*",
      // ~~Necessary due to https://github.com/trufflesuite/truffle/issues/1971~~
      // Necessary due to https://github.com/trufflesuite/truffle/issues/3008
      skipDryRun: true,

      // LINK contract addresses
      LINK:            "0xa36085F69e2889c224210F603D836748e7dC0088",
      ALARM_ORACLE:    "0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e",
      ALARM_JOB_ID:    "a7ab70d561d34eb49e9b1612fd2e044b",
      ALARM_JOB_ID_HEX:"0x6137616237306435363164333465623439653962313631326664326530343462",
      ALARM_FEE:       "100000000000000000",  // 0.1 * 10**18; // 0.1 LINK
      VRF_COORDINATOR: "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9",
      VRF_FEE:         "100000000000000000",  // 0.1 * 10**18; // 0.1 LINK
      VRF_KEYHASH:     "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4"
    },

    live: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC_LIVE, 'https://infura.io/v3/' + process.env.INFURA_API_KEY);
      },
      network_id: "*",
      // ~~Necessary due to https://github.com/trufflesuite/truffle/issues/1971~~
      // Necessary due to https://github.com/trufflesuite/truffle/issues/3008
      skipDryRun: true,

      // LINK contract addresses *TODO* check addresses !!
      LINK:            "0x514910771af9ca656af840dff83e8264ecf986ca",
      ALARM_ORACLE:    "0xc99B3D447826532722E41bc36e644ba3479E4365",
      ALARM_JOB_ID:    "2ebb1c1a4b1e4229adac24ee0b5f784f",
      ALARM_FEE:       "100000000000000000",
      VRF_COORDINATOR: "",
      VRF_FEE:         "100000000000000000",
      VRF_KEYHASH:     ""
    },

    rinkeby: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.infura.io/v3/' + process.env.INFURA_API_KEY);
      },
      network_id: "*",
      // ~~Necessary due to https://github.com/trufflesuite/truffle/issues/1971~~
      // Necessary due to https://github.com/trufflesuite/truffle/issues/3008
      skipDryRun: true,

      // LINK contract addresses
      LINK:            "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
      ALARM_ORACLE:    "0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e",
      ALARM_JOB_ID:    "4fff47c3982b4babba6a7dd694c9b204",
      ALARM_FEE:       "100000000000000000",
      VRF_COORDINATOR: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
      VRF_FEE:         "100000000000000000",
      VRF_KEYHASH:     "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311"
    },

    ropsten: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://ropsten.infura.io/v3/' + process.env.INFURA_API_KEY);
      },
      network_id: "*",
      // ~~Necessary due to https://github.com/trufflesuite/truffle/issues/1971~~
      // Necessary due to https://github.com/trufflesuite/truffle/issues/3008
      skipDryRun: true,

      // LINK contract addresses
      LINK:            "0x01BE23585060835E02B77ef475b0Cc51aA1e0709", // TODO ? 0x20fE562d797A42Dcb3399062AE9546cd06f63280
      ALARM_ORACLE:    "",
      ALARM_JOB_ID:    "",
      ALARM_FEE:       "100000000000000000",
      VRF_COORDINATOR: "0xf720CF1B963e0e7bE9F58fd471EFa67e7bF00cfb",
      VRF_FEE:         "100000000000000000",
      VRF_KEYHASH:     "0xced103054e349b8dfb51352f0f8fa9b5d20dde3d06f9f43cb2b85bc64b238205" // ???
    },

    goerli: {
      provider: () => {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://goerli.infura.io/v3/' + process.env.INFURA_API_KEY);
      },
      network_id: "*",
      // ~~Necessary due to https://github.com/trufflesuite/truffle/issues/1971~~
      // Necessary due to https://github.com/trufflesuite/truffle/issues/3008
      skipDryRun: true,

      // LINK contract addresses
      LINK:            "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
      ALARM_ORACLE:    "",
      ALARM_JOB_ID:    "",
      ALARM_FEE:       "100000000000000000",
      VRF_COORDINATOR: "",
      VRF_FEE:         "100000000000000000",
      VRF_KEYHASH:     ""
    },

  },

  compilers: {
    solc: {
      version: "0.6.12",
    },
  },
};
