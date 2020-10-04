# The simple microservices e-commerce platform example (Neversitup Coding Challenge)

## Architecture

![Architecture](https://raw.githubusercontent.com/paiboon15721/neversitup-oms/main/architecture.jpg).

## This repository consists of 8 containers

1. [Traefik](https://doc.traefik.io/traefik/) as a reverse proxy

2. Auth Service (Host: localhost)

   2.1 `GET /auth` (Used by Traefik for ForwardAuth)

   2.2 `POST /register`

   2.3 `POST /login`

   2.4 `POST /logout`

3. User Service (Host: user.localhost)

   3.1 `GET /profile` (Get current user profile by userId cookie)

   3.2 `GET /user/:id` (Used by Order service for Get user detail to fullfill order detail)

   3.3 `GET /orders` (Get current user orders history)

4. Product Service (Host: product.localhost)

   4.1 `GET /products` (Get products catalog)

   4.2 `GET /products/:id` (Get product detail)

   4.3 `POST /init-db` (For only initialize database, Must not do this in real application)

   \*\* This service doesn't need any authentication because it will be using as a product catalog page

5. Order Service (Host: order.localhost)

   5.1 `GET /orders` (Get all orders)

   5.2 `GET /orders/:id` (Get order detail)

   5.3 `POST /orders` (Create order)

   5.4 `PUT /orders/:id` (Update order)

6. User DB (Used by Auth and User Services)

7. Product DB (Used by Product Service)

8. Order DB (Used by Order Service)

## Quick start

1. Clone this repository

```bash
git clone git@github.com:paiboon15721/neversitup-oms.git
```

2. Start all services

```bash
cd neversitup-oms
docker-compose up -d
```

## API Testing

1. Install REST Client plugin for vscode

2. Go to `api_test/product.http` and Request to `POST {{host}}/init-db` API for seeding product catalog

3. Go to api_test/auth.http for register, login

4. Now, you can play around with all APIs

\*\* You need to get the productId from `GET {{host}}/products` API to get the existing productId for creating order

## Time Spent

1. Conceptual architecture design 1 hour

2. Detail API design 1 hour

3. Developing 3 hours

4. Testing 1 hour

5. Writing README 1 hour

Total: 7 hours

## License

This example is [MIT licensed](./LICENSE).
