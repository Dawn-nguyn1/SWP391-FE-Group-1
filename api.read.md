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
            {
              "id": 0,
              "imageUrl": "string",
              "sortOrder": 0,
              "attributeId": 0
            }
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

# manager combo
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
----
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
----
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
----
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
----
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

# admin dash board
GET
/api/manager/dashboard/order-detail


Parameters
Try it out
Name	Description
status
string
(query)
Default value : ALL

ALL
from *
string($date)
(query)
from
to *
string($date)
(query)
to
pageable *
object
(query)
Example Value
Schema
{
  "page": 0,
  "size": 1,
  "sort": [
    "string"
  ]
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
  "totalElements": 0,
  "totalPages": 0,
  "size": 0,
  "content": [
    {
      "id": 0,
      "orderCode": "string",
      "orderType": "IN_STOCK",
      "orderStatus": "PENDING",
      "totalAmount": 0,
      "deposit": 0,
      "remainingAmount": 0,
      "address": {
        "id": 0,
        "receiverName": "string",
        "phone": "string",
        "addressLine": "string",
        "ward": "string",
        "district": "string",
        "province": "string",
        "isDefault": true
      },
      "createdAt": "2026-03-26T17:06:47.132Z",
      "paymentMethod": "COD",
      "paymentStatus": "PENDING",
      "ghnOrderCode": "string",
      "shipmentStatus": "WAITING_CONFIRM",
      "approvalStatus": "PENDING_SUPPORT",
      "supportApprovedAt": "2026-03-26T17:06:47.132Z",
      "operationConfirmedAt": "2026-03-26T17:06:47.132Z",
      "deliveredAt": "2026-03-26T17:06:47.132Z",
      "items": [
        {
          "id": 0,
          "isCombo": true,
          "productVariantId": 0,
          "comboId": 0,
          "productName": "string",
          "variantName": "string",
          "productImage": "string",
          "quantity": 0,
          "price": 0
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



GET
/api/manager/dashboard/revenue-detail


Parameters
Try it out
Name	Description
type *
string
(query)
type
from *
string($date)
(query)
from
to *
string($date)
(query)
to
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
    "time": 0,
    "year": 0,
    "revenue": 0
  }
]

GET
/api/manager/dashboard


Parameters
Try it out
Name	Description
from
string($date)
(query)
from
to
string($date)
(query)
to
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
  "totalRevenue": 0,
  "totalOrders": 0,
  "averageOrderValue": 0,
  "cancellationRate": 0.1,
  "revenueByMonth": [
    {
      "time": 0,
      "year": 0,
      "revenue": 0
    }
  ],
  "revenueByQuarter": [
    {
      "time": 0,
      "year": 0,
      "revenue": 0
    }
  ],
  "paymentStats": [
    {
      "label": "string",
      "value": 0
    }
  ],
  "orderStats": [
    {
      "label": "string",
      "value": 0
    }
  ],
  "bestSellers": [
    {
      "productName": "string",
      "totalSold": 0
    }
  ],
  "lowStockProducts": [
    {
      "variantId": 0,
      "productName": "string",
      "stockQuantity": 0
    }
  ]
}

# 3333333333###campaign
GET
/api/manager/preorder-campaigns


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
    "startDate": "2026-03-30",
    "endDate": "2026-03-30",
    "fulfillmentDate": "2026-03-30",
    "preorderLimit": 0,
    "currentPreorders": 0,
    "isActive": true,
    "variantIds": [
      0
    ],
    "variantConfigs": [
      {
        "variantId": 0,
        "depositPercent": 0,
        "preorderPaymentOption": "DEPOSIT_ONLY"
      }
    ]
  }
]

# post
POST
/api/manager/preorder-campaigns


Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "name": "string",
  "startDate": "2026-03-30",
  "endDate": "2026-03-30",
  "fulfillmentDate": "2026-03-30",
  "preorderLimit": 0,
  "isActive": true,
  "variantConfigs": [
    {
      "variantId": 0,
      "depositPercent": 100,
      "preorderPaymentOption": "DEPOSIT_ONLY"
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
  "startDate": "2026-03-30",
  "endDate": "2026-03-30",
  "fulfillmentDate": "2026-03-30",
  "preorderLimit": 0,
  "currentPreorders": 0,
  "isActive": true,
  "variantIds": [
    0
  ],
  "variantConfigs": [
    {
      "variantId": 0,
      "depositPercent": 0,
      "preorderPaymentOption": "DEPOSIT_ONLY"
    }
  ]
}

### detail campagin
GETGET
/api/manager/preorder-campaigns/{campaignId}


Parameters
Try it out
Name	Description
campaignId *
integer($int64)
(path)
campaignId
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
  "startDate": "2026-03-30",
  "endDate": "2026-03-30",
  "fulfillmentDate": "2026-03-30",
  "preorderLimit": 0,
  "currentPreorders": 0,
  "isActive": true,
  "variantIds": [
    0
  ],
  "variantConfigs": [
    {
      "variantId": 0,
      "depositPercent": 0,
      "preorderPaymentOption": "DEPOSIT_ONLY"
    }
  ]
}

# update campaign
PUT
/api/manager/preorder-campaigns/{campaignId}


Parameters
Try it out
Name	Description
campaignId *
integer($int64)
(path)
campaignId
Request body

application/json
Example Value
Schema
{
  "name": "string",
  "startDate": "2026-03-30",
  "endDate": "2026-03-30",
  "fulfillmentDate": "2026-03-30",
  "preorderLimit": 0,
  "isActive": true,
  "variantConfigs": [
    {
      "variantId": 0,
      "depositPercent": 100,
      "preorderPaymentOption": "DEPOSIT_ONLY"
    }
  ]
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
  "startDate": "2026-03-30",
  "endDate": "2026-03-30",
  "fulfillmentDate": "2026-03-30",
  "preorderLimit": 0,
  "currentPreorders": 0,
  "isActive": true,
  "variantIds": [
    0
  ],
  "variantConfigs": [
    {
      "variantId": 0,
      "depositPercent": 0,
      "preorderPaymentOption": "DEPOSIT_ONLY"
    }
  ]
}
# delete campaign
DELETE
/api/manager/preorder-campaigns/{campaignId}


Parameters
Try it out
Name	Description
campaignId *
integer($int64)
(path)
campaignId
Responses
Code	Description	Links
204	
No Content

No links
