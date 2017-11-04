{
  "targets": [{
    "target_name": "pigpio",
    "conditions": [[
      "OS == \"linux\"", {
        "cflags": [
          "-Wno-unused-local-typedefs",
          "-Wno-deprecated-declarations"
        ]
      }]
    ],
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
    }
  }]
}

