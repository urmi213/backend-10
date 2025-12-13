## Description:
`/orders` GET route intentionally তৈরি করা হয়নি।
Order দেখতে `/orders/user/:email` route ব্যবহার করতে হবে।
সকল order creation local server (http://localhost:5000/orders) এ POST request দিয়ে পরীক্ষা করা হয়েছে।
Live backend secured এবং read-only, demonstration এর জন্য GET request local backend এ ব্যবহার করা হয়েছে।

## Example Endpoints:
/orders --> POST --> ❌ Does not work on live backend; requires local testing

## Get latest listings:

/listings/latest


## Get all listings with limit:

/listings?limit=10


## Get a single listing by ID:

/listings/:id

## Get user orders by email:

/orders/user/:email