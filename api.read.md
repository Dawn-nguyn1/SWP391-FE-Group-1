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
200	
OK

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


GET
/api/manager/products/{id}


Parameters
Cancel
Name	Description
id *
integer($int64)
(path)
1
Execute
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
  "status": "string",
  "productImage": "string"
}


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
200	
OK


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


GET
/api/manager/products


Parameters
Cancel
No parameters

Execute
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