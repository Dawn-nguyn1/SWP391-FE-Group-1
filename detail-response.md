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
            {
              "id": 0,
              "imageUrl": "string",
              "sortOrder": 0,
              "attributeId": 0
            }
          ]
        }
      ],
      "allowPreorder": true,
      "preorderLimit": 0,
      "currentPreorders": 0,
      "preorderStartDate": "2026-03-18",
      "preorderEndDate": "2026-03-18",
      "preorderFulfillmentDate": "2026-03-18",
      "availabilityStatus": "IN_STOCK"
    }
  ]
}