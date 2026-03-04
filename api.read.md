manager API


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
  "brandName": "string",
  "productImage": "string"
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
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "name": "string",
  "description": "string",
  "brandName": "string",
  "productImage": "string"
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
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 0,
    "pageSize": 0,
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
  "images": [
    {
      "imageUrl": "string",
      "sortOrder": 0
    }
  ]
}
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
