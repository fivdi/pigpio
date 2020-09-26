{
  "targets": [{
    "target_name": "pigpio",
    "conditions": [[
      'OS == "linux"', {
        "conditions": [[
          '"<!((which pigpiod 2>/dev/null) || echo not_found)" != "not_found"', {
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
                  "-Wno-deprecated-declarations",
                  "-Wno-cast-function-type"
                ]
              }]
            ]
          }]
        ]
      }]
    ]
  }]
}

