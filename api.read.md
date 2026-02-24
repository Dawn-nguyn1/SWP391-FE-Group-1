manager-controller


PUT
/api/manager/variants/{variantId}


Parameters
Try it out
Name	Description
variantId *
integer($int64)
(path)
variantId
Request body

application/json
Example Value
Schema
{
  "sku": "string",
  "price": 0,
  "stockQuantity": 0,
  "saleType": "IN_STOCK"
}
Responses
Code	Description	Links
201	
Created

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "sku": "string",
  "price": 0,
  "stockQuantity": 0,
  "saleType": "IN_STOCK"
}
No links

DELETE
/api/manager/variants/{variantId}


Parameters
Try it out
Name	Description
variantId *
integer($int64)
(path)
variantId
Responses
Code	Description	Links
204	
No Content

No links

GET
/api/manager/products/{id}


Parameters
Cancel
Name	Description
id *
integer($int64)
(path)
6
Execute
Clear
Responses
Curl

curl -X 'GET' \
  'http://localhost:8080/api/manager/products/6' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2Iiwicm9sZSI6Ik1BTkFHRVIiLCJpYXQiOjE3NzE4OTU1NjgsImV4cCI6MTc3MTg5NjQ2OH0.STPMMmCgQi5_toqJWm95oHpKAfuiAOHLohQKskU9MElBMVHDCtaLSr5SAd6Q19l1OWW-y4LQNJYDE3JLPwJshw'
Request URL
http://localhost:8080/api/manager/products/6
Server response
Code	Details
200	
Response body
Download
{
  "brandName": "asdasdasd",
  "description": "asdasdasdasdasdasdasdasdasd",
  "id": 6,
  "name": "asdasdasd",
  "productImage": "https://images.ctfassets.net/zcryw81f0g1x/ZwYzq8uyqTVBtfmWO4hr6/a12605fdd6772b52900387cf5ce4842f/Cat-Eye-Glasses-Nav-Card-33136813.jpg",
  "variants": [
    {
      "attributes": [
        {
          "id": 19,
          "attributeName": "Color",
          "attributeValue": "Pink",
          "images": []
        },
        {
          "id": 20,
          "attributeName": "Size",
          "attributeValue": "42",
          "images": []
        }
      ],
      "id": 6,
      "price": 1222,
      "saleType": "IN_STOCK",
      "sku": "SKU-002",
      "stockQuantity": 22
    },
    {
      "attributes": [
        {
          "id": 18,
          "attributeName": "Size",
          "attributeValue": "41",
          "images": [
            "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3",
            "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3",
            "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3",
            "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3"
          ]
        },
        {
          "id": 17,
          "attributeName": "Color",
          "attributeValue": "Black",
          "images": []
        }
      ],
      "id": 5,
      "price": 1000,
      "saleType": "IN_STOCK",
      "sku": "SKU-002",
      "stockQuantity": 10
    }
  ]
}
Response headers
 cache-control: no-cache,no-store,max-age=0,must-revalidate 
 connection: keep-alive 
 content-type: application/json 
 date: Tue,24 Feb 2026 01:17:17 GMT 
 expires: 0 
 keep-alive: timeout=60 
 pragma: no-cache 
 transfer-encoding: chunked 
 vary: Origin,Access-Control-Request-Method,Access-Control-Request-Headers 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-xss-protection: 0 
Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "name": "string",
  "brandName": "string",
  "description": "string",
  "productImage": "string",
  "variants": [
    {
      "id": 0,
      "sku": "string",
      "price": 0,
      "stockQuantity": 0,
      "saleType": "IN_STOCK",
      "attributes": [
        {
          "id": 0,
          "attributeName": "string",
          "attributeValue": "string",
          "images": [
            "string"
          ]
        }
      ]
    }
  ]
}
No links

PUT
/api/manager/products/{id}


Parameters
Cancel
Name	Description
id *
integer($int64)
(path)
id
Request body

application/json
Edit Value
Schema
{
  "name": "string",
  "description": "string",
  "brandName": "string",
  "productImage": "string"
}
Execute
Responses
Code	Description	Links
201	
Created

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "name": "string",
  "brandName": "string",
  "description": "string",
  "status": "string",
  "productImage": "string"
}
No links

DELETE
/api/manager/products/{id}


Parameters
Try it out
Name	Description
id *
integer($int64)
(path)
id
Responses
Code	Description	Links
204	
No Content

No links

GET
/api/manager/combos/{id}


Parameters
Try it out
Name	Description
id *
integer($int64)
(path)
id
Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "name": "string",
  "description": "string",
  "comboPrice": 0,
  "active": true,
  "items": [
    {
      "id": 0,
      "productVariantId": 0,
      "quantity": 0
    }
  ]
}
No links

PUT
/api/manager/combos/{id}


Parameters
Try it out
Name	Description
id *
integer($int64)
(path)
id
Request body

application/json
Example Value
Schema
{
  "name": "string",
  "description": "string",
  "items": [
    {
      "variantId": 0,
      "quantity": 1
    }
  ]
}
Responses
Code	Description	Links
204	
No Content

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "name": "string",
  "description": "string",
  "comboPrice": 0,
  "active": true,
  "items": [
    {
      "id": 0,
      "productVariantId": 0,
      "quantity": 0
    }
  ]
}
No links

DELETE
/api/manager/combos/{id}


Parameters
Try it out
Name	Description
id *
integer($int64)
(path)
id
Responses
Code	Description	Links
204	
No Content

No links

PUT
/api/manager/attributes/{attributeId}


Parameters
Try it out
Name	Description
attributeId *
integer($int64)
(path)
attributeId
Request body

application/json
Example Value
Schema
{
  "attributeName": "string",
  "attributeValue": "string"
}
Responses
Code	Description	Links
204	
No Content

No links

DELETE
/api/manager/attributes/{attributeId}


Parameters
Try it out
Name	Description
attributeId *
integer($int64)
(path)
attributeId
Responses
Code	Description	Links
204	
No Content

No links

POST
/api/manager/variants/{variantId}/attributes


Parameters
Try it out
Name	Description
variantId *
integer($int64)
(path)
variantId
Request body

application/json
Example Value
Schema
{
  "attributeName": "string",
  "attributeValue": "string"
}
Responses
Code	Description	Links
201	
Created

No links

GET
/api/manager/products


Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
[
  {
    "id": 0,
    "name": "string",
    "brandName": "string",
    "description": "string",
    "status": "string",
    "productImage": "string"
  }
]
No links

POST
/api/manager/products


Parameters
Cancel
No parameters

Request body

application/json
Edit Value
Schema
{
  "name": "string",
  "description": "string",
  "brandName": "string",
  "productImage": "string"
}
Execute
Responses
Code	Description	Links
201	
Created

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "name": "string",
  "brandName": "string",
  "description": "string",
  "status": "string",
  "productImage": "string"
}
No links

POST
/api/manager/products/{productId}/variants


Parameters
Try it out
Name	Description
productId *
integer($int64)
(path)
productId
Request body

application/json
Example Value
Schema
{
  "sku": "string",
  "price": 0,
  "stockQuantity": 0,
  "saleType": "IN_STOCK"
}
Responses
Code	Description	Links
201	
Created

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "sku": "string",
  "price": 0,
  "stockQuantity": 0,
  "saleType": "IN_STOCK"
}
No links

GET
/api/manager/combos


Parameters
Try it out
Name	Description
page
integer($int32)
(query)
Default value : 0

0
size
integer($int32)
(query)
Default value : 10

10
Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "totalPages": 0,
  "totalElements": 0,
  "size": 0,
  "content": [
    {
      "id": 0,
      "name": "string",
      "description": "string",
      "comboPrice": 0,
      "active": true,
      "items": [
        {
          "id": 0,
          "productVariantId": 0,
          "quantity": 0
        }
      ]
    }
  ],
  "number": 0,
  "first": true,
  "last": true,
  "numberOfElements": 0,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "pageable": {
    "offset": 0,
    "paged": true,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "pageSize": 0,
    "pageNumber": 0,
    "unpaged": true
  },
  "empty": true
}
No links

POST
/api/manager/combos


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "name": "string",
  "description": "string",
  "items": [
    {
      "variantId": 0,
      "quantity": 1
    }
  ]
}
Responses
Code	Description	Links
201	
Created

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": 0,
  "name": "string",
  "description": "string",
  "comboPrice": 0,
  "active": true,
  "items": [
    {
      "id": 0,
      "productVariantId": 0,
      "quantity": 0
    }
  ]
}
No links

POST
/api/manager/attributes/{attributeId}/images


Parameters
Cancel
Reset
Name	Description
attributeId *
integer($int64)
(path)
18
Request body

application/json
Edit Value
Schema
{
  "images": [
    {
      "imageUrl": "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3",
      "sortOrder": 1
    },
    {
      "imageUrl": "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3",
      "sortOrder": 2
    }
  ]
}
Execute
Clear
Responses
Curl

curl -X 'POST' \
  'http://localhost:8080/api/manager/attributes/18/images' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2Iiwicm9sZSI6Ik1BTkFHRVIiLCJpYXQiOjE3NzE4OTU1NjgsImV4cCI6MTc3MTg5NjQ2OH0.STPMMmCgQi5_toqJWm95oHpKAfuiAOHLohQKskU9MElBMVHDCtaLSr5SAd6Q19l1OWW-y4LQNJYDE3JLPwJshw' \
  -H 'Content-Type: application/json' \
  -d '{
  "images": [
    {
      "imageUrl": "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3",
      "sortOrder": 1
    },
    {
      "imageUrl": "https://tse1.explicit.bing.net/th/id/OIP.J25dXRQG6c0AGkj7IYwZPAHaHM?w=668&h=649&rs=1&pid=ImgDetMain&o=7&rm=3",
      "sortOrder": 2
    }
  ]
}'
Request URL
http://localhost:8080/api/manager/attributes/18/images
Server response
Code	Details
201	
Response headers
 cache-control: no-cache,no-store,max-age=0,must-revalidate 
 connection: keep-alive 
 content-length: 0 
 date: Tue,24 Feb 2026 01:17:12 GMT 
 expires: 0 
 keep-alive: timeout=60 
 pragma: no-cache 
 vary: Origin,Access-Control-Request-Method,Access-Control-Request-Headers 
 x-content-type-options: nosniff 
 x-frame-options: DENY 
 x-xss-protection: 0 
Responses
Code	Description	Links
201	
Created

No links

DELETE
/api/manager/attributes/images/{imageId}


Parameters
Try it out
Name	Description
imageId *
integer($int64)
(path)
imageId
Responses
Code	Description	Links
204	
No Content

No links
