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

## 01/04/2024
- Learn that angular only accepts/loads static items such as images if they're present in the "assets" folder

## 01/05/2024
- Successfully show images of cubes on frontend
- Do this by encoding images present in backend to base64, writing it to the json file, and decoding it in the frontend
    - Code to create the base64 encoded string from local image path is in server.js file
- Generate titles and descriptions of 24 cubes using chatgpt
    - prompt blueprint: Generate a cool, fantasy name(without cube, prism, or nexus in it) and short, descriptive fantasy description for a [category] cube [describe the image]
    - I included the "without cube, prism, or nexus" part in the prompt because the names were getting repetitive and it generated unique names after that.
    - example prompt: Generate a cool, fantasy name(without cube, prism, or nexus in it) and short, descriptive fantasy description for a glass cube containing a snow-capped mountain situated on an island with a lush forest surrounding its base
- Ideas for more cubes:
    - Natural Disasters: tornado, volcano, tsunami, earthquake, lightning(this would be cool)
    - Man-Made Structures: house, mansion, monuments, statues
    - Machine/Technological: Circuitry, electrical, buttons?, tiled/grid?
    - Fantasy/Mythical: runes, bloodmarks, inscriptions of prayer, hieroglyphics?, cave man paintings
    - Hollow: Has holes in the center of each side with something inside; shiny sphere in center?, Maybe Static Electricity Ball
    - Biological: brain in formaldehyde, Mini Dragons, an imposing eyeball
    - Infinite/Repeating: fractal cube, abstract art, "infinite 3d cube" on google
- Let back-end handle any and all changes the user makes to category, sort, and limit
    - does this with a get request with multiple request queries(sort and limit) and one request parameter(category)

## 01/06/2024
- Generate 25 more cubes, will probably not use all

## 01/07/2024
- Add some of the generated cubes to cube-details.json file


# Website Versions:

### V1 - 01/05/2024
![Website V1 of Cube Store Application Website](./images/Cube_Store_V1.jpg)

## Works Cited
- Inspiration from: https://www.youtube.com/watch?v=Kbauf9IgsC4&t=265s