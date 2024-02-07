# About this App
Cube Store App lets you choose from a wide assortment of hand-picked artisan cubes!

## Link to Site

- http://18.118.238.40:4200
    - hosted on AWS(Amazon Web Services) on t2.micro ec2 instance. 
    <strike>
    - WARNING: images load extremely slowly because the images are sent to frontend from backend encoded in base64 and as a result, the json file is large. I'll create a loading animation to play while the images are getting fetched from the backend api. 
    </strike>
        - fixed on 2024/1/24

## Architecture:
- Angular as front-end using Tailwind CSS and Material Framework components
- Node as back-end api to retrieve cubes and proceed to checkout
    - REST api
- Stripe for payment handling
    - implementation in stripe docs: https://stripe.com/docs/payments/during-payment/charge-shipping?payment-ui=checkout

## Features:
- Sort cubes by categories
- Can also sort by ascending/descending order, load 12,24, or 36 cubes, and change viewing style
- Add cubes to cart and change quantity in cart page
- Checkout and pay for cubes

# Website Versions:

### V2 - 2024/01/06
![Website V2 of Cube Store Application Website](./images/Cube_Store_V2.jpg)

### V1 - 2024/01/05
![Website V1 of Cube Store Application Website](./images/Cube_Store_V1.jpg)


## Works Cited
- Inspiration from: https://www.youtube.com/watch?v=Kbauf9IgsC4&t=265s

# Updates

## 2023/12/31
- Cube store works with fakestoreapi and stripe checkout(images won't show in stripe checkout, but will deal with it later)
- goal is to replace fakestoreapi with own api that has different cubes with images generated with stable diffusion
- also need different categories that match with these cubes
    - material: All, Metal, Plastic, Wood, Glass, Paper,
    - size: All, small, medium, large
    - cost maybe?: All, cheap, normal, expensive, custom
    - age: All, <100yrs, 100-1000yrs, >1000yrs

## 2024/01/02
- Generate variety of cubes with stable diffusion (might create more cubes/redo old ones using controlNet)
    - stable diffusion setup: https://www.youtube.com/watch?v=nBpD-RbglPw 

## 2024/01/04
- Learn that angular only accepts/loads static items such as images if they're present in the "assets" folder

## 2024/01/05
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

## 2024/01/06
- Generate 25 more cubes, will probably not use all

## 2024/01/07
- Add some of the generated cubes to cube-details.json file

## 2024/01/08
- Make docker images of angular front-end and node back-end server and have them successfully run in localhost
    - docker container start-up code for front-end: docker run -d -p 4200:80 cube-store:frontend-v1 
    - docker container start-up code for back-end: docker run -d -p 4242:4242 cube-store:backend-v1 

## 2024/01/09 - 2024/01/10
- Host website on AWS(Amazon Web Services) t2.micro ec2 instance
    - initial thoughts are that this t2.micro instance handles loads much better than GCP's e2.micro, but will have to see after I implement a database for the images instead of just a .json file

## 2024/01/14
- Rename repository to "cube-store-application"
- lower more prices on cubes(they were in the millions and billions) because Strip has a cap on how much money can be in checkout

## 2024/01/24
- Statically serve all images with the node.js server in localhost
- Website loads images much, much faster and feels extremely responsive when changing categories.
    - Will implement lazy loading in images so that the images are loaded even faster
- Will implement in the AWS server as well, just need to change localhost to the ip address of the AWS vm
- Website is up and images load almost instantaneously, much better QoL and feel

## 2024/02/01
- Fix stripe checkout in AWS VM
    - the api call was still pointing to localhost instead of the ip address of VM
- add docker-compose.yml file to AWS VM for easier setup of docker containers
    - add to repository for version control and for future

## 2024/02/04
- implement sorting by size

## 2024/02/05
- implement sorting by minimum and maximum size
- price was set as string in json file("price": "21" instead of "price": 21), so after changing this, the filter for price worked fine.

## 2024/02/07
- implement error handling for price sort with mat-error
- used the email example in the Angular Material UI to help as ChatGPT's code was weird and didn't work. I didn't need a form, just the formControl for each input
    - https://material.angular.io/components/form-field/examples
- need to make a custom validator that makes the minimum and maximum price rely on each other. I want to have an error message that shows when the minimum price is greater than the maximum price, and when the maximum price is less than the minimum price(same case?)
- add cube svg logo that looks too big, but feels good compared to a smaller size: might change this later