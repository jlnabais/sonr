cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "com-badrit-macaddress.MacAddress",
        "file": "plugins/com-badrit-macaddress/www/MacAddress.js",
        "pluginId": "com-badrit-macaddress",
        "clobbers": [
            "window.MacAddress"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.3.0",
    "com-badrit-macaddress": "0.2.0"
};
// BOTTOM OF METADATA
});