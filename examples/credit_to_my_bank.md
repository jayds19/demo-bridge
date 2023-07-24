Llega un POST a la ruta `/credits` (`prepareCredit`) de este servicio desplegado

```json
{
  "hash": "9dc5f2f2dda8eed0ae44d7b2cec307bb6573701ab734a928db02bbe49b87a577",
  "data": {
    "handle": "cre_1Sm8kSR00M0vU1kSL",
    "schema": "credit",
    "symbol": {
      "handle": "usd"
    },
    "target": {
      "handle": "account:000000000001@acap"
    },
    "amount": 1500,
    "intent": {
      "hash": "f0b6a4499fcc80bd57b0794c11c79e857f3dc48c485e2aba6adbb90b484fd470",
      "data": {
        "handle": "EMS5KMdtEkzoNdaU2tPoE",
        "claims": [
          {
            "action": "transfer",
            "amount": 1500,
            "source": "account:1234@tesla",
            "symbol": "usd",
            "target": "account:000000000001@acap"
          }
        ],
        "access": [
          {
            "action": "any",
            "signer": {
              "public": "ybXFU5axQ9j9bzrsGCDW/GkaCJ1KXwn+U8hy91CYHU8="
            }
          },
          {
            "action": "read",
            "bearer": {
              "$signer": {
                "public": "ybXFU5axQ9j9bzrsGCDW/GkaCJ1KXwn+U8hy91CYHU8="
              }
            }
          }
        ]
      },
      "meta": {
        "proofs": [
          {
            "custom": {
              "moment": "2023-07-21T19:04:53.353Z",
              "status": "created"
            },
            "digest": "8bb83aa89fbb0608c5ac857f8ba6a39ae1ec74acd64072bf3bc1ecb986ba84ba",
            "method": "ed25519-v2",
            "public": "ybXFU5axQ9j9bzrsGCDW/GkaCJ1KXwn+U8hy91CYHU8=",
            "result": "cJjKu5hlurd7hrlmUZtINXuHk6dExjiprHRY0PfmXLnEoXHS0nKW1J3DGdmsqrKK5G/9UfiSoCXWwcYg7E5mCg=="
          }
        ],
        "status": "pending",
        "thread": "i3ZIfswSEn43-7hns",
        "moment": "2023-07-21T19:04:54.453Z"
      }
    }
  },
  "meta": {
    "proofs": [
      {
        "method": "ed25519-v2",
        "public": "9+anQm7Kv7SKF7ga5jOaTOqhOcH3ZH+ZUBh99X1JqNs=",
        "digest": "00dafd955f23855ad7abb5778691bb4a38776b32de56693db60affa9bc08619b",
        "result": "CPLNoX5gOGrN3lYQoZlijSlfVpM1et9PkFQOrW04MkCKIczqDFj63x6YIfVmQMT/bdOrvcVZKCVu+p/sgrQbDw=="
      }
    ]
  }
}
```
