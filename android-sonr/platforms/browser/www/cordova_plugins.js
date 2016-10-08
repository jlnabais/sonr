cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com-badrit-macaddress/www/MacAddress.js",
        "id": "com-badrit-macaddress.MacAddress",
        "pluginId": "com-badrit-macaddress",
        "clobbers": [
            "window.MacAddress"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com-badrit-macaddress": "0.2.0",
    "cordova-plugin-whitelist": "1.3.0"
}
// BOTTOM OF METADATA
});