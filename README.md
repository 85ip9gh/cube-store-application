# About this App
Cube Store App lets you choose from a wide assortment of hand-picked artisan cubes!

## Architecture:
- Angular as front-end using Tailwind CSS and Material Framework
- Node as back-end api to retrieve cubes and proceed to checkout
    - REST api
- Stripe for payment handling
    - implementation in stripe docs: https://stripe.com/docs/payments/during-payment/charge-shipping?payment-ui=checkout

## Features:
- Sort cubes by categories
- Can also sort by ascending/descending order, load 12,24, or 36 cubes, and change viewing style
- Add cubes to cart and change quantity in cart page
- Checkout and pay for cubes

## 12/31/2023
- Cube store works with fakestoreapi and stripe checkout(images won't show in stripe checkout, but will deal with it later)
- goal is to replace fakestoreapi with own api that has different cubes with images generated with stable diffusion
- also need different categories that match with these cubes
    - material: All, Metal, Plastic, Wood, Glass, Paper,
    - size: All, small, medium, large
    - cost maybe?: All, cheap, normal, expensive, custom
    - age: All, <100yrs, 100-1000yrs, >1000yrs

## 01/02/2024
- Generate variety of cubes with stable diffusion (might create more cubes/redo old ones using controlNet)
    - stable diffusion setup: https://www.youtube.com/watch?v=nBpD-RbglPw 

## Works Cited
- Inspiration from: https://www.youtube.com/watch?v=Kbauf9IgsC4&t=265s