{
    "variables": {
        "NODEJS": "<!(['sh', '-c', 'which nodejs || which node'])"
    },
    "targets": [
        {
            "target_name": "sample",
            "defines": [ "NAPI_DISABLE_CPP_EXCEPTIONS" ],
            "sources": [ "src/sample.cpp" ],
            "include_dirs": [
                "<!(<(NODEJS) -p \"require('node-addon-api').include\")"
            ],
            "libraries": [
            ]
        },
        {
            "target_name": "install_sample_node",
            "dependencies": ["sample"],
            "actions": [
                {
                    "action_name": "install_sample_node",
                    "inputs": [
                        "<@(PRODUCT_DIR)/sample.node"
                    ],
                    "outputs": [
                        "sample.node"
                    ],
                    "action": ["cp", "<@(PRODUCT_DIR)/sample.node", "sample-<(OS)-<!(uname -m|sed s/aarch64/arm64/|sed s/armv7l/arm/|sed s/x86_64/x64/).node"]
                }
            ]
        }
    ]
}
