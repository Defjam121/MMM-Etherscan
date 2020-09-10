# MMM-Etherscan

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

This module shows wallet stats from https://etherscan.io api.<br/> <br/> 

## Installing the module
Clone this repository in your `~/MagicMirror/modules/`:

`git clone https://github.com/Helpi90/MMM-Etherscan`


## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-Etherscan',
            position: 'top_left',
            config: {
                addresses: [
                {
                    "name": "",
                    "address": "",
                },
                ],
                apiKey: "",
            }
        }
    ]
}
```



## Configuration options

| **Option** | **Default** | **Description** |
| --- | --- | --- |
| `addresses` | `[ ]` | *Required* <br/>The wallet addresses from your wallets
| `name` | `" "` | *Required* <br/> Name for the wallet
| `address` | `" "` | *Required* <br/> Wallet address
| `apiKey` | `" "` | *Required* <br/> The API key from etherscan.io
| `updateInterval` |  `60000` |*Optional* <br/>How often should the data be fetched. <br><br>**Type:** `int`(milliseconds)