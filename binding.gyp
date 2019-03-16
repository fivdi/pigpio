{
  "targets": [{
    "target_name": "pigpio",
    "conditions": [[
      'OS == "linux"', {
        "include_dirs" : [
          "<!(node -e \"require('nan')\")"
        ],
        "sources": [
          "./src/pigpio.cc"
        ],
        "link_settings": {
          "libraries": [
            "-lpigpio"
          ]
        },
        "conditions": [[
          '"<!(echo $V)" != "1"', {
            "cflags": [
              "-Wno-deprecated-declarations"
            ]
          }]
        ]
      }]
    ]
  }]
}

